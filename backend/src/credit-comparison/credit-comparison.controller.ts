import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Logger,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Workbook } from 'exceljs';
import PDFDocument from 'pdfkit';
import { CreditComparisonService } from './credit-comparison.service';
import { SimulateCreditDto } from './dto/simulate-credit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SimulationResponse, CreditResult } from './interfaces/credit-types';

@Controller('credit')
export class CreditComparisonController {
  private readonly logger = new Logger(CreditComparisonController.name);

  constructor(private readonly creditService: CreditComparisonService) {}

  @Post('simulate')
  async simulate(@Body() dto: SimulateCreditDto) {
    return this.creditService.simulate(dto);
  }

  @Get('entities')
  async getEntities() {
    return this.creditService.getEntities();
  }

  @Get('simulations')
  @UseGuards(JwtAuthGuard)
  async getUserSimulations(@Request() req: { user: { id: string } }) {
    return this.creditService.getUserSimulations(req.user.id);
  }

  @Post('simulations/save')
  @UseGuards(JwtAuthGuard)
  async saveSimulation(
    @Body() body: SimulateCreditDto & { nombre?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.creditService.saveSimulation(req.user.id, body, body.nombre);
  }

  @Get('export/:id/xlsx')
  @UseGuards(JwtAuthGuard)
  async exportXlsx(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Res() res: Response,
  ) {
    this.logger.log(`Excel export requested for simulation ${id} by user ${req.user.id}`);

    const sim = await this.creditService.getSavedSimulation(id);
    if (!sim) {
      throw new NotFoundException(`Simulation ${id} not found`);
    }

    const result = sim.result as unknown as SimulationResponse;
    const eligibleResults = result.resultados.filter((r: CreditResult) => r.elegible);

    const workbook = new Workbook();
    workbook.creator = 'FinLab';
    workbook.created = new Date();

    // Sheet 1: Resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Entidad', key: 'entidad', width: 25 },
      { header: 'Tasa EA (%)', key: 'tasaEA', width: 14 },
      { header: 'Cuota Mensual', key: 'cuotaMensual', width: 18 },
      { header: 'Total Intereses', key: 'totalIntereses', width: 18 },
      { header: 'Total Pagado', key: 'totalPagado', width: 18 },
      { header: 'VPN', key: 'vpn', width: 16 },
      { header: 'Semáforo', key: 'semaforo', width: 12 },
    ];

    // Style header row
    const headerRow = summarySheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const r of eligibleResults) {
      const row = summarySheet.addRow({
        entidad: r.entidad.name,
        tasaEA: parseFloat((r.tasaEA * 100).toFixed(2)),
        cuotaMensual: r.cuotaMensual,
        totalIntereses: r.totalIntereses,
        totalPagado: r.totalPagado,
        vpn: r.vpn,
        semaforo: r.semaforo,
      });

      // Color-code the semaforo cell
      const semaforoCell = row.getCell('semaforo');
      const color =
        r.semaforo === 'verde'
          ? 'FF00B050'
          : r.semaforo === 'amarillo'
            ? 'FFFFC000'
            : 'FFFF0000';
      semaforoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    }

    // Format currency columns
    ['cuotaMensual', 'totalIntereses', 'totalPagado', 'vpn'].forEach((col) => {
      summarySheet.getColumn(col).numFmt = '#,##0.00';
    });

    // Sheet 2: Amortization table for the best-VPN entity
    if (eligibleResults.length > 0) {
      const best = eligibleResults.reduce((a, b) => (a.vpn > b.vpn ? a : b));
      const sheetName = `Amort ${best.entidad.name}`.slice(0, 31); // Excel tab limit
      const amortSheet = workbook.addWorksheet(sheetName);

      amortSheet.columns = [
        { header: 'Mes', key: 'mes', width: 8 },
        { header: 'Saldo Inicial', key: 'saldoInicial', width: 18 },
        { header: 'Cuota', key: 'cuota', width: 16 },
        { header: 'Interés', key: 'interes', width: 16 },
        { header: 'Abono Capital', key: 'abonoCapital', width: 16 },
        { header: 'Saldo Final', key: 'saldoFinal', width: 18 },
      ];

      const amortHeader = amortSheet.getRow(1);
      amortHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      amortHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A5F' },
      };

      for (const row of best.tablaAmortizacion) {
        amortSheet.addRow(row);
      }

      ['saldoInicial', 'cuota', 'interes', 'abonoCapital', 'saldoFinal'].forEach((col) => {
        amortSheet.getColumn(col).numFmt = '#,##0.00';
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="simulacion-${id}.xlsx"`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  }

  @Get('export/:id/pdf')
  @UseGuards(JwtAuthGuard)
  async exportPdf(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Res() res: Response,
  ) {
    this.logger.log(`PDF export requested for simulation ${id} by user ${req.user.id}`);

    const sim = await this.creditService.getSavedSimulation(id);
    if (!sim) {
      throw new NotFoundException(`Simulation ${id} not found`);
    }

    const result = sim.result as unknown as SimulationResponse;
    const eligibleResults = result.resultados.filter((r: CreditResult) => r.elegible);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="simulacion-${id}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // ---- Title ----
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Análisis de Financiamiento — FinLab', { align: 'center' });
    doc.moveDown(0.5);

    // ---- Simulation info ----
    doc.fontSize(11).font('Helvetica');
    doc.text(`Monto solicitado: ${this.formatCOP(result.monto)}`);
    doc.text(`Plazo: ${result.plazoMeses} meses`);
    doc.text(`Fecha de cálculo: ${result.fechaCalculo}`);
    doc.text(`IPC anual utilizado: ${(result.ipcAnualUsado * 100).toFixed(2)}%`);
    doc.moveDown(1);

    // ---- Eligible entities table ----
    doc.fontSize(13).font('Helvetica-Bold').text('Entidades Elegibles', { underline: true });
    doc.moveDown(0.4);

    if (eligibleResults.length === 0) {
      doc.fontSize(11).font('Helvetica').text('No hay entidades elegibles para este monto y plazo.');
    } else {
      const colWidths = [140, 60, 80, 80, 80, 60, 60];
      const headers = ['Entidad', 'Tasa EA', 'Cuota/mes', 'Total Int.', 'Total Pag.', 'VPN', 'Semáforo'];
      const startX = doc.page.margins.left;
      let y = doc.y;

      // Draw header row
      doc.fontSize(9).font('Helvetica-Bold');
      let x = startX;
      headers.forEach((h, i) => {
        doc.text(h, x, y, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      y += 16;
      doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
      y += 4;

      // Draw data rows
      doc.fontSize(9).font('Helvetica');
      for (const r of eligibleResults) {
        if (y > doc.page.height - doc.page.margins.bottom - 30) {
          doc.addPage();
          y = doc.page.margins.top;
        }
        x = startX;
        const cols = [
          r.entidad.name,
          `${(r.tasaEA * 100).toFixed(2)}%`,
          this.formatCOP(r.cuotaMensual),
          this.formatCOP(r.totalIntereses),
          this.formatCOP(r.totalPagado),
          this.formatCOP(r.vpn),
          r.semaforo,
        ];
        cols.forEach((val, i) => {
          doc.text(val, x, y, { width: colWidths[i], ellipsis: true });
          x += colWidths[i];
        });
        y += 16;
      }
    }

    doc.moveDown(1.5);

    // ---- Recommendation ----
    doc.fontSize(13).font('Helvetica-Bold').text('Recomendación', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11).font('Helvetica-Bold').text(`Mejor opción: ${result.recomendacion.mejorOpcion}`);
    doc.fontSize(10).font('Helvetica').text(result.recomendacion.razon);

    // ---- Footer ----
    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor('gray')
      .text('Generado por FinLab · Análisis de crédito para Colombia', { align: 'center' });

    doc.end();
  }

  // ---- Private helpers ----

  private formatCOP(value: number): string {
    return (
      '$' +
      Math.round(value)
        .toLocaleString('es-CO')
        .replace(/,/g, '.')
    );
  }
}

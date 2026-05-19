import { Injectable } from '@nestjs/common';

export interface SectorInfo {
  code: string;
  name: string;
  wacc: number;
}

@Injectable()
export class WaccService {
  /**
   * WACC values by sector — Damodaran emerging markets adjusted for Colombia.
   * Base: Damodaran US WACCs + ~3.5% country risk premium.
   * Reference: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.html
   */
  private readonly sectors: SectorInfo[] = [
    { code: 'tech_saas',     name: 'Tecnología / SaaS / Software',    wacc: 0.115 },
    { code: 'retail',        name: 'Retail / Comercio',               wacc: 0.100 },
    { code: 'manufactura',   name: 'Manufactura / Producción',        wacc: 0.110 },
    { code: 'servicios',     name: 'Servicios profesionales',         wacc: 0.125 },
    { code: 'construccion',  name: 'Construcción / Inmobiliario',     wacc: 0.130 },
    { code: 'agro',          name: 'Agricultura / Agroindustria',     wacc: 0.105 },
    { code: 'salud',         name: 'Salud / Healthcare',              wacc: 0.105 },
    { code: 'educacion',     name: 'Educación',                       wacc: 0.110 },
    { code: 'alimentos',     name: 'Alimentos y bebidas',             wacc: 0.100 },
    { code: 'transporte',    name: 'Transporte y logística',          wacc: 0.115 },
    { code: 'turismo',       name: 'Turismo y hospitalidad',          wacc: 0.120 },
    { code: 'energia',       name: 'Energía y servicios públicos',    wacc: 0.095 },
    { code: 'otros',         name: 'Otros',                           wacc: 0.110 },
  ];

  getAllSectors(): SectorInfo[] {
    return [...this.sectors];
  }

  getWacc(sectorCode: string): number {
    const sector = this.sectors.find((s) => s.code === sectorCode);
    if (!sector) throw new Error(`Sector no reconocido: ${sectorCode}`);
    return sector.wacc;
  }

  getSectorInfo(sectorCode: string): SectorInfo {
    const sector = this.sectors.find((s) => s.code === sectorCode);
    if (!sector) throw new Error(`Sector no reconocido: ${sectorCode}`);
    return { ...sector };
  }

  isValidSector(sectorCode: string): boolean {
    return this.sectors.some((s) => s.code === sectorCode);
  }
}

declare module "lunar-javascript" {
  export interface LunarTime {
    getZhi(): string;
    getGanZhi(): string;
    getTianShen(): string;
    getTianShenType(): string;
    getTianShenLuck(): string;
    getChongDesc(): string;
    getSha(): string;
    getYi(): string[];
    getJi(): string[];
  }

  export interface JieQi {
    getName(): string;
  }

  export interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
  }

  export interface NineStar {
    toString(): string;
  }

  export interface Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getYearInGanZhiByLiChun(): string;
    getMonthInGanZhi(): string;
    getMonthZhi(): string;
    getDayInGanZhi(): string;
    getDayNaYin(): string;
    getJieQi(): string;
    getPrevJieQi(wholeDay?: boolean): JieQi;
    getZhiXing(): string;
    getXiu(): string;
    getXiuLuck(): string;
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getDayTianShenLuck(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getTimes(): LunarTime[];
    getDayZhi(): string;
    getDayZhiExact(): string;
    getDayGanIndexExact(): number;
    getWuHou(): string;
    getLiuYao(): string;
    getXiuSong(): string;
    getAnimal(): string;
    getZheng(): string;
    getDayPositionTai(): string;
    getDayNineStar(): NineStar;
    getDayPositionXiDesc(): string;
    getDayPositionFuDesc(): string;
    getDayPositionCaiDesc(): string;
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGuiDesc(): string;
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getEightChar(): EightChar;
    getSolar(): Solar;
  }

  export interface Solar {
    getLunar(): Lunar;
    getFestivals(): string[];
    toYmd(): string;
  }

  export const Solar: {
    fromYmd(year: number, month: number, day: number): Solar;
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
  };

  export const Lunar: {
    fromYmd(year: number, month: number, day: number): Lunar;
  };

  export const LunarYear: {
    fromYear(year: number): { getLeapMonth(): number };
  };

  export const LunarUtil: {
    getDayYi(monthGanZhi: string, dayGanZhi: string): string[];
    getDayJi(monthGanZhi: string, dayGanZhi: string): string[];
    GAN: string[];
    ZHI: string[];
    TIAN_SHEN: string[];
    ZHI_TIAN_SHEN_OFFSET: Record<string, number>;
    TIAN_SHEN_TYPE: Record<string, string>;
    TIAN_SHEN_TYPE_LUCK: Record<string, string>;
    YI_JI: string[];
  };
}

import chalk from "chalk";

const header = `
        ,,qzQ''f''^Qzp､*
    ##j^,::::::::::::::"k,*
 ####kk:::::,jq|uUuU|kkk,hq*
####/::::88//VJ└JJJJ┘ii┘\\/ﾉﾊ*
####V:::///j｣ ｒ‐┬   ｒ‐┬ ｢/ﾊ*
####<::/ｲ/j|   乂ﾉ    乂ﾉ { j,*
 ####Vｒへ/ﾊj       ~    丿jﾊ*          "Unreal Engine用 HeightMap等作成ツール"
  ####<l/////jﾊ ,  ┬--＜ jl||ﾉ*
 #####(((___))vﾊ   p   ﾊl,j))*        "GeoModeler v.3.0.0"
#####/ '        ",/      Vﾊ*
#####{     ﾊ     /        ﾊq*
`
  .replace(/#/g, chalk.blue("#"))
  .replace(/\*/g, chalk.red("*"));

export default header;

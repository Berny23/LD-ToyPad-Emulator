export function RGBToHex(
  r: number,
  g: number,
  b: number,
  applyFilter: boolean = true
) {
  const components = {
    red: TwoCharacterHex(r),
    green: TwoCharacterHex(g),
    blue: TwoCharacterHex(b),
  };

  const hex = `#${components.red}${components.green}${components.blue}`;

  if (!applyFilter) {
    return hex;
  }

  switch (hex) {
    //idle (full white)
    case "#99420e":
      return "#ffffff";

    //rainbow sequence (title screen, some are used by keystones)
    //case "#ff0000": //red
    //break;
    case "#ff6e00":
      return "#ffff00"; //yellow
    case "#006e00":
      return "#00ff00"; //green
    case "#006e18":
      return "#00ffff"; //cyan
    //also batman stealth
    case "#000018":
      return "#0000ff"; //blue
    case "#ff0018":
      return "#ff00ff"; //pink

    //wyldstyle scanner
    case "#f00016":
      return "#ff2de6";

    //shift keystone (dark colors for blink animation)
    case "#002007":
      return "#007575";
    case "#4c2000":
      return "#757500";
    case "#4c0007":
      return "#750075";

    //chroma keystone

    case "#3f1b05":
      return "#b0b0b0";
    case "#4c2007":
      return "#757575";
    case "#3f1b00":
      return "#b0b000";
    case "#3f0000":
      return "#b00000";
    case "#000005":
      return "#0000b0";
    case "#001b00":
      return "#00b000";
    case "#ff2700":
      return "#ffa200";
    case "#3f0900":
      return "#b06f00";
    case "#44000d":
      return "#d500ff";
    case "#110003":
      return "#9300b0";

    //element keystone
    case "#000016":
      return "#0000ff";
    case "#006700":
      return "#00ff00";
    case "#f00000":
      return "#ff0000";
    //case "#000016": //TODO: DUPLICATE
    //return "#00ffff";

    //scale keystone
    case "#ff1e00":
      return "#ffa200";
    case "#f06716":
      return "#ffffff";

    //locate keystone (too many possible values to find by hand. need help here)

    //green (hack minigame)
    case "#003700":
      return "#00ff00";

    //other
    case "#ff6e18":
      return "#ffffff";

    default:
      return hex;
  }
}
function TwoCharacterHex(component: number) {
  return component.toString(16).padStart(2, "0");
}

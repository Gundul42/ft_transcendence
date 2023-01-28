import * as konst from "../../constants";
import { Ballpos } from "./ball";

export function moveIt(Ballref) {
    Ballref.posx += Ballref.velx;
    Ballref.posy += Ballref.vely;

    if (Ballref.posx < 0) {
        Ballref.posx *= -1;
        Ballref.velx *= -1;
    }
    if (Ballref.posy < 0) {
        Ballref.posy *= -1;
        Ballref.vely *= -1;
    }
    if (Ballref.posx >= (konst.playFieldXMaxSize) - 20) {
        Ballref.posx -= Ballref.posx - (konst.playFieldXMaxSize -20);
        Ballref.velx *= -1;
    }
    if (Ballref.posy >= (konst.playFieldYMaxSize) -20) {
        Ballref.posy -= Ballref.posy - (konst.playFieldYMaxSize -20);
        Ballref.vely *= -1;
    }
    //console.log(posx, posy, velx, vely);
}

import { Ttune } from "../subtuneTypes/Tune";
import { Tsubtune } from "../subtuneTypes/Subtune"
import { Tplaylist } from "../subtuneTypes/Playlist"

import { nanoid } from "nanoid";

export const setDraggableId = (tune: Ttune) => {
    let new_tune = {...tune};
    new_tune.draggableId = nanoid(16);
    return new_tune;
}

export const setDraggableIds = (tunes: Ttune[]) =>{
    tunes = tunes.map(tune => {
        tune.draggableId = nanoid(16);
        return tune;
    })
    return tunes;
}

export const setDroppableId = (item: Tsubtune | Tplaylist) => {
    item.droppableId = nanoid(16);
    return item;
}

export const setDroppableIds = (list: Tsubtune[] | Tplaylist[]) =>{
    list = list.map(subList => {
        subList.droppableId = nanoid(16);
        return subList;
    })
    return list;
}

// process backend data and prep for drag and drop operations
export const prepSubtunesForDnd = (data: any) => {
    let cleanData = data.map((item: { subtune: Tsubtune }) => item.subtune);
    cleanData = cleanData.map((item: Tsubtune) => {
        item = setDroppableId(item);
        item.tunes = setDraggableIds(item.tunes);
        return item;
    });
    return cleanData;
}

// process backend data and prep for drag and drop operations
export const prepPlaylistsForDnd = (data: any) => {
    console.log("raw data: ", data)
    let cleanData = data.map((item: { playlist: Tplaylist }) => item.playlist);
    cleanData = cleanData.map((item: Tplaylist) => {
        item = setDroppableId(item);
        setDraggableIds(item.tunes);
        return item;
    });
    return cleanData;
}

export function hexToRGB(hex: string, alpha: number) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

export function rgbaToHex(rgba: number[]): string {
    // Convert RGBA to HEX
    const hex = '#' + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);

    return hex;
}

export function rgbaToHex_alpha(rgba: number[], alpha?: number): string {
    // Use the provided alpha value if present, otherwise use the alpha value from the list
    const alphaValue = alpha !== undefined ? alpha : rgba[3];
    
    // Convert RGBA to HEX
    const hex = '#' + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);

    return hex;
}
import { is_valid_string, valid_string } from "./validators.ts";

/**
 * Returns the number of days between two dates (in MM/DD/YYYY format)
 * @param {string} a 
 * @param {string} b 
 * @param {boolean?} absolute 
 * @returns 
 */
export function diff_dates(a:string, b:string, absolute = false) {
    const ta = toUtcMidnight(a);
    const tb = toUtcMidnight(b);
    const days = Math.round((ta - tb) / 86_400_000); // 24*60*60*1000
    return absolute ? Math.abs(days) : days;
}

/**
 * Convert MM/DD/YYYY format to UTC number
 * @param {*} mdy 
 * @returns 
 */
export function toUtcMidnight(mdy:string) {
    const parts = mdy.split('/');
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: ${mdy}`);
    }
  
    let parts_num = parts.map(n => parseInt(n, 10) as number);
    let m = parts_num[0] as number;
    let d = parts_num[1] as number;
    let y = parts_num[2] as number;
    if (!Number.isInteger(m) || !Number.isInteger(d) || !Number.isInteger(y)) {
        throw new Error(`Invalid date numbers: ${mdy}`);
    }
  
    const t = Date.UTC(y, m - 1, d);
    const dt = new Date(t);
  
    if (
        dt.getUTCFullYear() !== y ||
        dt.getUTCMonth() !== m - 1 ||
        dt.getUTCDate() !== d
    ) {
        throw new Error(`Nonexistent calendar date: ${mdy}`);
    }
  
    return t;
}

export function mkstr(char:string, length:number): string {
    let str = [];
    for(let i=0; i < length; i++) {
        str.push(char);
    }

    return str.join("");
}

export function pad_left(str:string, char:string, length:number): string {
    if(length > str.length) {
        return mkstr(char, length - str.length) + str;
    } else {
        return str;
    }
}

/**
 * @returns {string}
 */
export function get_current_date(): string {
    //@ts-ignore
    let date:Array<string> = new Date(Date.now()).toLocaleString("en-US", { timeZone: "America/New_York" }).split(",")[0].split("/");

    if(date.length < 3) {
        throw new Error(`Bad date returned`);
    }

    // make sure all have correct digits
    return [
        pad_left(date[0] as string, '0', 2),
        pad_left(date[1] as string, '0', 2),
        pad_left(date[2] as string, '0', 4)
    ].join("/");
}


/**
 * Validate release date
 * mm/dd/yy format
 * year 1900 to current+2
 * month 1 to 12
 * day 1 to last of month
 */
export function is_valid_date(d:string) {
    try {
        valid_string(d);
    } catch (e) {
        return false;
    }

    let date = d.trim().split("/");

    //validate length
    if(date.length !== 3) {
        return false;
    }

    // validate all date parts are valid
    for(let i=0; i < 3; i++) {
        if(!is_valid_string(date[i])) {
            return false;
        }

        // date string length validation
        if(i < 2) {
            if(date[i].length !== 2) {
                return false;
            }
        } else {
            if(date[i].length !== 4) {
                return false;
            }
        }
    }

    // validate all date parts are integers
    for(let i=0; i < 3; i++) {
        if(Number.isNaN(parseInt(date[i]))) {
            return false;
        }

        // if int and float parse evaluates differently, number is not int
        if(!Number.isInteger(parseFloat(date[i]))) {
            return false;
        }
    }

    // assign all parts as integers
    const month = parseInt(date[0]);
    const day = parseInt(date[1]);
    const year = parseInt(date[2]);
    const current_year = new Date().getFullYear();

    // validate year
    if(year < 1900 || year > (current_year+2)) {
        return false;
    }

    // validate month
    if(month < 1 || month > 12) {
        return false;
    }

    // validate day
    if(day < 1 || day > (new Date(year, month, 0).getDate())) {
        return false;
    }

    return true;
}
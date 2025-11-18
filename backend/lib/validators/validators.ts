import { ObjectId } from "mongodb"
import { is_valid_date } from "./helpers.ts";

const REG = {
    email: /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
}

const STUDENT_AGE_RANGE = [16, 100];

export const VALIDATOR_TESTS = {
    INSTRUCTOR_NOID: {
        first_name: valid_name,
        last_name: valid_name,
        department: valid_string,
        email: valid_email,
        phone: valid_phone_number,
        office: valid_string,
        date_hired: valid_date,
    },
    INSTRUCTOR: {
        _id: valid_objectid,
        first_name: valid_name,
        last_name: valid_name,
        department: valid_string,
        email: valid_email,
        phone: valid_phone_number,
        office: valid_string,
        date_hired: valid_date,
    },

    STUDENT_NOID: {
        first_name: valid_name,
        last_name: valid_name,
        email: valid_email,
        date_of_birth: valid_date,
        major: valid_string,
        gpa: valid_gpa
    },
    STUDENT: {
        _id: valid_objectid,
        first_name: valid_name,
        last_name: valid_name,
        email: valid_email,
        date_of_birth: valid_date,
        major: valid_string,
        gpa: valid_gpa
    },

    COURSE_NOID: {
        course_name: valid_string,
        department: valid_string,
        credits: valid_natural_number,
        instructor: valid_objectid,
        start_date: valid_date,
        end_date: valid_date
    },
    COURSE: {
        _id: valid_objectid,
        course_name: valid_string,
        department: valid_string,
        credits: valid_natural_number,
        instructor: valid_objectid,
        start_date: valid_date,
        end_date: valid_date
    }
}

/**
 * check if string is only spaces
 * @type {(str:string) => void}
 * @param {*} str: string to process
 * @returns boolean indicating if string contains non-space chars
 */
export function is_valid_string(str:string) {
    if(typeof str !== "string") {
        //throw new Error(`Invalid data type: ${typeof str} given to string validator.`);
        return false;
    }

    if(str.trim().length === 0) {
        //throw new Error(`String must not be empty.`);
        return false;
    }

    return true;
}

/**
 * Validate that a value is a non-empty string
 * @param {string} string
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_string(string:string,  _varname?:string, _propname?:string, _funcname?:string) {
    if (!(typeof string === "string")) {
        throw new Error(`Expected type "string", recieved "${typeof string}". ${info_string(_varname, _propname, _funcname)}`);
    }

    if (!string.length) {
        throw new Error(`Recieved empty string. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate n is a natural number (positive, whole int)
 * @param {unknown} n 
 */
export function valid_natural_number(n:string,  _varname?:string, _propname?:string, _funcname?:string) {
    if(Number.isNaN(parseInt(n as string))) {
        throw new Error(`Not a number: ${n}. ${info_string(`n`, undefined, `valid_natural_number`)}`);
    }

    if(parseInt(n) !== parseFloat(n)) {
        throw new Error(`Expected integer, recieved float. ${info_string(`n`, undefined, `valid_natural_number`)}`);
    }

    if(parseInt(n) < 0) {
        throw new Error(`Number must not be negative. ${info_string(`n`, undefined, `valid_natural_number`)}`);
    }
}

/**
 * Validate that a value is a legal port number
 * @param {number} port
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_port(port:number,  _varname?:string, _propname?:string, _funcname?:string) {
    if (typeof port !== "number") {
        throw new Error(`Expected type "number", recieved "${typeof port}". ${info_string(_varname, _propname, _funcname)}`);
    }

    if (Number.isNaN(port)) {
        throw new Error(`Recieved NaN value for port. ${info_string(_varname, _propname, _funcname)}`);
    }

    if (port < 1) {
        throw new Error(`Illegal port value: ${port}. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate that a value is a valid URL
 * @param {string} url
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_url(url:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(url, "url", undefined, "valid_url");

    try {
        new URL(url);
    } catch (e) {
        throw new Error(`Invalid url: ${e}. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate structure of email
 * @param {string} email 
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_email(email:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(email, _varname, _propname, _funcname);
    if (!email.includes('@')) {
        throw new Error(`Malformed email (missing @). ${info_string(_varname, _propname, _funcname)}`);
    }
    let parts = email.split('@');
    if (parts.length !== 2) {
        throw new Error(`Malformed email (missing components (expected 2, got ${parts.length})). ${info_string(_varname, _propname, _funcname)}`);
    }
    try {
        valid_string(parts[0] as string, _varname, _propname, _funcname);
        valid_string(parts[1] as string, _varname, _propname, _funcname);
    }
    catch (e) {
        throw new Error(`Malformed email (${e}). ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate email with regex
 * @param {unknown} email 
 * @param {string} _varname 
 * @param {string} _propname 
 * @param {string} _funcname
 * @returns {asserts email as string} 
 */
export function valid_email_reg(email:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(email, _varname, _propname, _funcname);
    if(!REG.email.exec(email)) {
        throw new Error(`Invalid email format: ${email}. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate phone number format
 * @param {string} number 
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_phone_number(number:string,  _varname?:string, _propname?:string, _funcname?:string) {
    const numerics = "0123456789".split('');
    valid_string(number, _varname, _propname, _funcname);
    const split = number.split('-');

    // validate length
    if(split.length !== 3) {
        throw new Error(`Invalid phone number format, expected "###-###-####". ${info_string(_varname, _propname, _funcname)}`);
    }

    // validate individual section lengths
    if((split[0] as string).length !== 3) {
        throw new Error(`Invalid phone number format, first section must contain 3 digits. ${info_string(_varname, _propname, _funcname)}`);
    }
    if((split[1] as string).length !== 3) {
        throw new Error(`Invalid phone number format, second section must contain 3 digits. ${info_string(_varname, _propname, _funcname)}`);
    }
    if((split[2] as string).length !== 4) {
        throw new Error(`Invalid phone number format, third section must contain 4 digits. ${info_string(_varname, _propname, _funcname)}`);
    }

    // validate section content
    for(const i in split) {
        // check each character
        for(const char of split[i].split('')) {
            if(!numerics.includes(char)) {
                throw new Error(`Illegal character '${char}' in phone number. ${info_string(_varname, _propname, _funcname)}`);
            }
        }

        let int = parseInt(split[i]);
        if(Number.isNaN(int)) {
            throw new Error(`Invalid phone number value: ${split[i]} is not a valid integer. ${info_string(_varname, _propname, _funcname)}`);
        }

        // make sure it's not negative somehow
        if(int < 0) {
            throw new Error(`Invalid phone number value, cannot be negative. How the hell did you even do that? ${info_string(_varname, _propname, _funcname)}`);
        }
    }
}

/**
 * 
 * @param {string} date 
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {void}
 */
export function valid_date(date:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(date,  _varname, _propname, _funcname);
    if(!is_valid_date(date)) {
        throw new Error(`Invalid date: ${date}. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * Validate GPA format
 * @param {number} gpa 
 * @param {string} _varname 
 * @param {string} _propname 
 * @param {string} _funcname 
 * @returns {void}
 */
export function valid_gpa(gpa:number,  _varname?:string, _propname?:string, _funcname?:string) {
    if(typeof gpa !== "number") {
        throw new Error(`GPA Must be a number type, recieved ${typeof gpa}. ${info_string(_varname, _propname, _funcname)}`);
    }

    if(gpa < 1 || gpa > 4) {
        throw new Error(`GPA must be between 1 and 4. ${info_string(_varname, _propname, _funcname)}`);
    }

    let gpa_string = String(gpa);
    if(gpa_string.includes('.') && gpa_string.split('.')[1].length > 2) {
        throw new Error(`GPA Cannot include more than two decimal places. ${info_string(_varname, _propname, _funcname)}`);
    }
}

export function valid_name(name:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(name,  _varname, _propname, _funcname);

    if(name.length < 2) {
        throw new Error(`Name must be >= 2 chars in length. ${info_string(_varname, _propname, _funcname)}`);
    }
}

export function valid_objectid(objid:string,  _varname?:string, _propname?:string, _funcname?:string) {
    valid_string(objid,  _varname, _propname, _funcname);

    if(!ObjectId.isValid(objid)) {
        throw new Error(`Invalid object Id. ${info_string(_varname, _propname, _funcname)}`);
    }
}

/**
 * 
 * 
 * BEGIN OBJECT VALIDATORS
 * 
 * 
 */

/**
 * Create a formatted info string for error messages
 * @param {string} [_varname]
 * @param {string} [_propname]
 * @param {string} [_funcname]
 * @returns {string}
 */
export function info_string(_varname?:string, _propname?:string, _funcname?:string) {
    let function_info = (_funcname)
        ? `In function <${_funcname}>`
        : '';
    let var_info = (_varname)
        ? ((_propname)
            ? `Accessing property <${_propname}> of <${_varname}>`
            : `Accessing variable <${_varname}>`)
        : ``;
    let info = [function_info, var_info].join(' | ');
    return (info.length) ? info : "";
}
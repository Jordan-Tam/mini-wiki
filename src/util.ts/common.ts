export function failwith(message:any, code?:number): never {
    console.error(message);
    process.exit((typeof code === "number")? code : 1);
}
// copy the uml-sprinkler files to the node_modules.bin or ./../../
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';


const files = ['uml-sprinkler', 'uml-sprinkler.bat']
files.forEach(file => {
    const src = join(__dirname, file);
    const dest = join(__dirname, './../../');
    const local = join(__dirname, './../../node_modules/.bin');
    try {
        if (existsSync(src)) {
            if (existsSync(local)) {
                console.log(`copying ${src} to ${local}`);
                copyFileSync(src, local);
            } else {
                console.log(`copying ${src} to ${dest}`);
                copyFileSync(src, dest);
            }
        }
        else {
            console.log(`file ${src} does not exist`);
        }
    } catch (e) {
        console.log(e);
    }

});

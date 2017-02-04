import * as fs from 'fs';
import * as program from 'commander';
import {IExportedCommand} from 'commander';
import * as path from 'path';
const finger = require('fingerprinting');
const packageContent = require('./package.json');
const cliPath = process.cwd();

interface ICliParams {
    source: string;
}

function configureCommander(): void {
    program
        .version(packageContent.version)
        .option('-s, --source <value>', '当前文件名')
        .parse(process.argv);
}

function createFile(path: string, newFileName: string) {
    fs.createReadStream(path).pipe(fs.createWriteStream(newFileName));
}

function getExtension(str: string): string {
    const splits = str.split('.');
    if (splits.length === 0) {
        return '';
    }
    return splits[splits.length - 1];
}

function convertPath2Absolute(rawPath: string): string {
    if (path.isAbsolute(rawPath)) {
        return rawPath;
    }
    return path.resolve(cliPath, rawPath);
}

function getCliParams(): ICliParams {
    const source = (program as ICliParams&IExportedCommand).source;
    if (!source) {
        program.outputHelp();
        throw `请输入文件名`;
    }
    return {
        source: convertPath2Absolute(source),
    }
}

export default function exec(cliParams?: ICliParams) {
    configureCommander();
    if (arguments.length === 0) {
        cliParams = cliParams || getCliParams();
    }
    if (!cliParams.source) {
        program.outputHelp();
        throw `请输入文件名`;
    }

    const absolutePath = cliParams.source;
    fs.readFile(absolutePath, function (err, buffer) {
        if (err) throw err;
        const print = finger(absolutePath, {content: buffer});
        const extension = getExtension(absolutePath);
        const newFileName = print.id + (extension ? '.' + extension : '');
        createFile(absolutePath, newFileName);
    });
}
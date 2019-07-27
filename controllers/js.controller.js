const fs = require('fs');
// const AdmZip = require('adm-zip');

// let fileVariable;
// exports.fileVariable = fileVariable;

exports.readFileJS = (req, res) => {
    fs.writeFile(process.env.MARATONA_ID + '.js', req.file.buffer, (err) => {
        if (err) res.status(500).send({ err: true, msg: err });
        else {
            fileVariable = req.file.buffer;
            fs.readFile(process.env.MARATONA_ID + '.js', 'utf8', (err, data) => {
                if (err) console.error(err);
                else {
                    const jsFile = JSON.stringify(data);
                    const listFunctions = jsFile.match(/(async)\s([a-zA-Z0-9_]+)/g);
                    const listNames = [];
                    listFunctions.forEach(element => {
                        listNames.push(element.replace('async ', ''));
                    });
                    console.log(`LIST NAMES = ${listNames}`);
                    // const content = req.file.buffer;
                    // zip.addFile("./file2.js", Buffer.alloc(content.length, content), "");
                    // zip.addLocalFile("./file2.js");
                    // zip.writeZip(process.env.MARATONA_ID + '_js.zip');
                    // fs.unlinkSync('./file2.js');
                    res.status(200).send({ result: listNames });
                }
            });
        }
    })
}
require('dotenv').config();
const fs = require('fs');
// const AdmZip = require('adm-zip');
// const zip = new AdmZip();

// let fileVariable;
// exports.fileVariable = fileVariable;

exports.readFileJSON = (req, res) => {
    fs.writeFile(process.env.MARATONA_ID + '.json', req.file.buffer, (err) => {
        if (err) res.status(500).send({ err: true, msg: err });
        else {
            this.fileVariable = req.file.buffer;
            fs.readFile(process.env.MARATONA_ID + '.json', (err, data) => {
                if (err) console.error(err);
                else {
                    const jsonArray = JSON.parse(data);
                    let pastState;
                    let CREATE = 0;
                    let UPDATE = 0;
                    let DELETE = 0;
                    let INSERT_COURSE = 0;
                    let ERROR = 0;
                    jsonArray.forEach(object => {
                        try {
                            if (!pastState) {
                                CREATE += 1;
                                console.log('CREATE');
                            } else if (pastState.transaction !== "" && object.transaction === "") {
                                DELETE += 1;
                                console.log('DELETE');
                            } else if ((pastState.transaction.courses && object.transaction.courses)
                                && pastState.transaction.courses.length !== object.transaction.courses.length
                                && object.transaction.courses !== "") {
                                INSERT_COURSE += 1;
                                console.log('INSERT_COURSE');
                            } else if (object.transaction.name !== pastState.transaction.name
                                || object.transaction.cpf !== pastState.transaction.cpf
                                || pastState.transaction.courses !== object.transaction.courses) {
                                UPDATE += 1;
                                console.log('UPDATE');
                            } else {
                                ERROR += 1;
                                console.log('ERROR');
                            }
                            pastState = object;
                        } catch (err) {
                            console.err(err);
                        }
                    });

                    console.log("\nRESULTADO:");
                    console.log(`CREATE => ${CREATE}`);
                    console.log(`UPDATE => ${UPDATE}`);
                    console.log(`DELETE => ${DELETE}`);
                    console.log(`INSERT_COURSE => ${INSERT_COURSE}`);
                    console.log(`ERROR => ${ERROR}`);
                    // const content = req.file.buffer;
                    // zip.addFile("./file.json", Buffer.alloc(content.length, content), "");
                    // zip.addLocalFile("./file.json");
                    // zip.writeZip(process.env.MARATONA_ID + '_json.zip');
                    // fs.unlinkSync('./file.json');
                    res.status(201).send({
                        result: {
                            create: CREATE,
                            update: UPDATE,
                            delete: DELETE,
                            insert_course: INSERT_COURSE,
                            error: ERROR
                        }
                    });
                }
            });
        }
    })
}

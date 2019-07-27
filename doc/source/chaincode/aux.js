class Aux {
    static async iteratorForJSON(iterator, history) {
        const results = [];
        while (true) {
            let object = await iterator.next();
            if (object.value && object.value.value.toString()) {
                let jsonObject = {};
                if (history && history === true) {
                    jsonObject.TxId = object.value.tx_id;
                    jsonObject.dateTransaction = new Date(object.value.timestamp.seconds.low * 1000 - (1000 * 60 * 60 * 3));
                    try {
                        jsonObject.transaction = JSON.parse(object.value.value.toString('utf8'));
                    } catch (err) {
                        console.error(err);
                        jsonObject.transaction = object.value.value.toString('utf8');
                    }
                } else {
                    jsonObject.key = object.value.key;
                    try {
                        jsonObject.transaction = JSON.parse(object.value.value.toString('utf8'));
                    } catch (err) {
                        console.error(err);
                        jsonObject.transaction = object.value.value.toString('utf8');
                    }
                }
                results.push(jsonObject);
            }
            if (object.done) {
                await iterator.close();
                return results;
            }
        }
    }
}

module.exports = Aux;

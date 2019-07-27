module.exports = class NLURequest {
    constructor(service, input, model) {
        this.service = service
        this.input = input
        if (model) {
            this.parameters = {
                'features': {
                    'entities': {
                        'model': model
                    },
                    'relations': {
                        'model': model
                    }
                },
                'language': 'pt'
            };
        } else {
            this.parameters = {
                'features': {
                    'sentiment': {},
                    'categories': {},
                    'keywords': {},
                    'concepts': {},
                    'entities': {},
                    'relations': {}
                },
                'language': 'pt'
            };
        }
    }

    execute() {
        if (this.input.length > 50000) {
            return new Promise((resolve, reject) => {
                var promises = []
                for (let i = 0; i <= Math.floor(this.input.length / 50000); i++) {
                    promises.push(analyze(this.service, this.input.slice(i * 50000, (i + 1) * 50000), this.parameters))
                }
                Promise.all(promises).then((results) => {
                    //console.log(results)
                    let body = {}
                    if (results[0].usage) {
                        body.usage = reduceUsage(results)
                    }
                    if (results[0].sentiment) {
                        body.sentiment = reduceSentiment(results)
                    }
                    if (results[0].relations) {
                        body.relations = reduceRelations(results)
                    }
                    if (results[0].keywords) {
                        body.keywords = reduceKeywords(results)
                    }
                    if (results[0].entities) {
                        body.entities = reduceEntities(results)
                    }
                    if (results[0].concepts) {
                        body.concepts = reduceConcepts(results)
                    }
                    if (results[0].categories) {
                        body.categories = reduceCategories(results)
                    }
                    resolve(body)
                }).catch(err => reject(err))
            })
        }
        else {
            return analyze(this.service, this.input, this.parameters)
        }
    }
}

const analyze = (service, input, parameters) => {
    parameters.text = input
    return new Promise((resolve, reject) => {
        service.analyze(parameters, (err, response) => {
            err ? reject(err) : resolve(response);
        });
    })
}

const reduceUsage = (nlu_array) => {
    let usage = {
        text_units: 0,
        text_characters: 0,
        features: 0
    }

    return nlu_array.reduce((total, current) => {
        return {
            text_units: total.text_units + current.usage.text_units,
            text_characters: total.text_characters + current.usage.text_characters,
            features: current.usage.features
        }
    }, usage)
}

const reduceSentiment = (nlu_array) => {
    let sentiment = {
        document: {
            score: 0,
            label: "neutral"
        }
    }

    sentiment = nlu_array.reduce((total, current) => {

        return {
            document: {
                score: total.document.score + current.sentiment.document.score / nlu_array.length,
                label: "neutral"
            }
        }
    }, sentiment)

    if (sentiment.document.score > 0) {
        sentiment.document.label = "positive"
    } else if (sentiment.document.score < 0) {
        sentiment.document.label = "negative"
    } else {
        sentiment.document.label = "neutral"
    }

    return sentiment
}

const reduceRelations = (nlu_array) => {
    return nlu_array.reduce((total, current) => {
        return total.concat(current.relations)
    }, []).sort((a, b) => {
        return b.score - a.score
    })
}

const reduceEntities = (nlu_array) => {
    let concat = nlu_array.reduce((total, current) => {
        return total.concat(current.entities)
    }, [])

    let sum = concat.reduce((total, current, index) => {
        let find = total.findIndex((entity) => {
            return current.text == entity.text
        })
        if (find == -1) {
            total.push(current)
            return total
        } else {
            if (current.count) {
                total[find].count += current.count
            }
            if (current.relevance) {
                total[find].relevance += current.relevance
            }
            if (total[find].times) {
                total[find].times += 1
            } else {
                total[find].times = 2
            }
            return total
        }
    }, [])

    return sum.map(relevancemap).sort(trysorting)
}

const reduceKeywords = (nlu_array) => {
    let concat = nlu_array.reduce((total, current) => {
        return total.concat(current.keywords)
    }, [])

    let sum = concat.reduce((total, current, index) => {
        let find = total.findIndex((keyword) => {
            return current.text == keyword.text
        })
        if (find == -1) {
            total.push(current)
            return total
        } else {
            if (current.count) {
                total[find].count += current.count
            }
            if (current.relevance) {
                total[find].relevance += current.relevance
            }
            if (total[find].times) {
                total[find].times += 1
            } else {
                total[find].times = 2
            }
            return total
        }
    }, [])

    return sum.map(relevancemap).sort(trysorting)
}

const reduceConcepts = (nlu_array) => {
    let concat = nlu_array.reduce((total, current) => {
        return total.concat(current.concepts)
    }, [])

    let sum = concat.reduce((total, current, index) => {
        let find = total.findIndex((concept) => {
            return current.text == concept.text
        })
        if (find == -1) {
            total.push(current)
            return total
        } else {
            if (current.count) {
                total[find].count += current.count
            }
            if (current.relevance) {
                total[find].relevance += current.relevance
            }
            if (total[find].times) {
                total[find].times += 1
            } else {
                total[find].times = 2
            }
            return total
        }
    }, [])

    return sum.map(relevancemap).sort(trysorting)
}

const reduceCategories = (nlu_array) => {
    let concat = nlu_array.reduce((total, current) => {
        return total.concat(current.categories)
    }, [])

    let sum = concat.reduce((total, current, index) => {
        let find = total.findIndex((categories) => {
            return current.label == categories.label
        })
        if (find == -1) {
            total.push(current)
            return total
        } else {
            if (current.count) {
                total[find].count += current.count
            }
            if (current.score) {
                total[find].score += current.score
            }
            if (total[find].times) {
                total[find].times += 1
            } else {
                total[find].times = 2
            }
            return total
        }
    }, [])

    return sum.map((obj) => {
        if (obj.score && obj.times) {
            obj.score = Math.round((obj.score / obj.times) * 1000000) / 1000000
            return obj
        } else {
            return obj
        }
    }).sort((a, b) => b.score - a.score)
}

function trysorting(a, b) {
    if (a.relevance) {
        return b.relevance - a.relevance
    } else if (a.count) {
        return b.count - a.count
    } else {
        return
    }
}

function relevancemap(obj) {
    if (obj.relevance && obj.times) {
        obj.relevance = Math.round((obj.relevance / obj.times) * 1000000) / 1000000
        return obj
    } else {
        return obj
    }
}
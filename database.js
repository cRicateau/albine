const sqlite3 = require('sqlite3');

const handleError = (resolve, reject) => {
    return error => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    }
}

module.exports = async filename => {
    const database = new sqlite3.Database(filename);
    await new Promise((resolve, reject) => {
        database.exec(`
            create table if not exists tweet(
                id integer primary key not null,
                date text not null,
                expeditor text not null,
                message text not null
            );
            create table if not exists vote(
                id integer primary key not null,
                date text not null,
                expeditor text not null,
                choice boolean not null
            );
            create table if not exists question(
                id integer primary key not null,
                formulation text not null,
                correctAnswer boolean not null
            );
            insert or replace into question(id, formulation, correctAnswer) values
                (1, "Qui a fait le premier pas ?", 1),
                (2, "Qui avait le plus de peluches étant petit(e) ?", 0)
            ;
            create table if not exists answer(
                id integer primary key not null,
                date text not null,
                expeditor text not null,
                questionId integer not null,
                choice boolean not null,
                foreign key(questionId) references question(id),
                unique(expeditor, questionId)
            );
        `, handleError(resolve, reject));
    });
    return {
        addTweet: async (date, expeditor, message) => {
            return new Promise((resolve, reject) => {
                database.exec(`
                    insert into tweet(date, expeditor, message) values(
                        "${date.toISOString()}",
                        "${expeditor.replace(/"/g, '""')}",
                        "${message.replace(/"/g, '""')}"
                    );
                `, handleError(resolve, reject));
            });
        },
        addVote: async (date, expeditor, choice) => {
            return new Promise((resolve, reject) => {
                database.exec(`
                    insert into vote(date, expeditor, choice) values(
                        "${date.toISOString()}",
                        "${expeditor.replace(/"/g, '""')}",
                        ${choice}
                    );
                `, handleError(resolve, reject));
            });
        },
        addAnswer: async (date, expeditor, questionId, choice) => {
            return new Promise((resolve, reject) => {
                database.exec(`
                    insert or replace into answer(date, expeditor, questionId, choice) values(
                        "${date.toISOString()}",
                        "${expeditor.replace(/"/g, '""')}",
                        ${questionId},
                        ${choice}
                    );
                `, handleError(resolve, reject));
            });
        },
        getMostRecentTweets: async limit => {
            return new Promise((resolve, reject) => {
                database.all(`select message from tweet order by date desc limit ${limit};`, (error, rows) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows.map(row => row.message));
                    }
                });
            });
        },
        getVotes: async () => {
            return new Promise((resolve, reject) => {
                database.get(`
                    select
                        total(case when choice == 0 then 1 else 0 end) as albert,
                        total(case when choice == 1 then 1 else 0 end) as pauline
                    from vote;
                `, (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
            });
        },
        getQuestion: async id => {
            return new Promise((resolve, reject) => {
                database.get(`select formulation, correctAnswer from question where id == ${id};`, (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
            });
        },
        getNumberOfAnswers: async id => {
            return new Promise((resolve, reject) => {
                database.get(`select count(id) as numberOfAnswers from answer where questionId == ${id};`, (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row.numberOfAnswers);
                    }
                });
            });
        },
        getAnswers: async id => {
            return new Promise((resolve, reject) => {
                database.get(`
                    select
                        total(case when choice == 0 then 1 else 0 end) as albert,
                        total(case when choice == 1 then 1 else 0 end) as pauline
                    from answer
                    where questionId == ${id};
                `, (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
            });
        },
    };
};

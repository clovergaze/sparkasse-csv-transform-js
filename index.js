const fs = require('fs');
const csv = require('csv');

const csvFile = process.argv[2];

if (!fs.existsSync(csvFile)) {
    console.error(`The CSV file \'${csvFile}\' does not exist.`);
    process.exit(1);
}

const parser = csv.parse({
    delimiter: ';',
    columns: true
});

const orderedColumns = [
    'Buchungstag',
    'Betrag',
    'Waehrung',
    'Verwendungszweck',
    'Beguenstigter/Zahlungspflichtiger',
    'Buchungstext',
    'Info',
    'Valutadatum',
    'Kontonummer/IBAN',
    'BIC (SWIFT-Code)',
    'Kundenreferenz (End-to-End)'
];

let startDate = '';
let endDate = '';

const transformer = csv.transform((record, callback) => {

    startDate = record['Buchungstag'];

    if (!endDate) {
        endDate = record['Buchungstag'];
    }

    let result = '';

    const row = [];
    orderedColumns.forEach((columnName) => {
        row.push(record[columnName].trim().replace(/\s{2,}/g, ' '))
    });

    result += row.join(';') + '\n';

    callback(null, result)

}, (error, output) => {

    const index = startDate.lastIndexOf('.') + 1;
    startDate = [startDate.slice(0, index), '20', startDate.slice(index)].join('');
    endDate = [endDate.slice(0, index), '20', endDate.slice(index)].join('');

    const writer = fs.createWriteStream(`Umsätze vom ${startDate} bis ${endDate}.csv`);

    headers = orderedColumns.join(';') + '\n';
    writer.write(headers);

    output.forEach(row => {
        writer.write(row);
    })

    writer.end();

    console.log('DONE!');
});

fs.createReadStream(csvFile).pipe(parser).pipe(transformer);

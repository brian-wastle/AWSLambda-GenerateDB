import 'dotenv/config'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import https from 'https';
import { URL } from 'url';

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
    try {
        const apiUrl = process.env.API_URL;
        const headers = {
            'Appid': process.env.APP_ID,
            'Token': process.env.TOKEN,
            'Content-Type': 'application/json'
        };

        const body = JSON.stringify([
            "AAPL", "MSFT", "NVDA", "GOOG", "AMZN", "META", "BRKB", "LLY", "AVGO", "TSLA"
        ]);
        
        
        //When generating a new database, this will reset the start date to 1 year prior to the current date
        const currentDate = new Date();
        const previousYear = new Date(currentDate);
        previousYear.setFullYear(currentDate.getFullYear() - 1);
        const year = previousYear.getFullYear();
        const month = String(previousYear.getMonth() + 1).padStart(2, '0');
        const day = String(previousYear.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const params = new URLSearchParams({ start: formattedDate }).toString();

        const options = {
            method: 'POST',
            headers: headers,
            path: `${apiUrl}?${params}`,
            hostname: new URL(apiUrl).hostname
        };

        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.on('error', (error) => reject(error));
            req.write(body);
            req.end();
        });

        const data = response.datalist;
        for (const stockData of data) {
            const ticker = stockData.ticker;
            for (const entry of stockData.datarange) {
                const formattedDate = convertToISODate(entry.date.strdate);
                const item = {
                    TableName: process.env.TABLE_NAME,
                    Item: {
                        date: { S: formattedDate }, 
                        ticker: { S: ticker },    
                        price: { N: entry.price.toString() }
                    }
                };
                const putItemCommand = new PutItemCommand(item);
                await dynamoDBClient.send(putItemCommand);
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify('Data loaded successfully!')
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Failed to load data.')
        };
    }
};


const convertToISODate = (dateStr) => {
    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
};
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class SheetsService {
  constructor() {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
  }

  async syncInventory(products) {
    try {
      const values = products.map(product => [
        product.id,
        product.name,
        product.description,
        product.price,
        product.quantity,
        product.category,
        product.thc_content,
        product.cbd_content,
        product.strain_type,
        new Date().toISOString()
      ]);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Inventory!A2:J',
        valueInputOption: 'RAW',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error);
      throw error;
    }
  }

  async getInventory() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Inventory!A2:J',
      });

      return response.data.values.map(row => ({
        id: row[0],
        name: row[1],
        description: row[2],
        price: parseFloat(row[3]),
        quantity: parseInt(row[4]),
        category: row[5],
        thc_content: row[6],
        cbd_content: row[7],
        strain_type: row[8],
        last_updated: row[9],
      }));
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  }

  async updateProduct(productId, updates) {
    try {
      const inventory = await this.getInventory();
      const rowIndex = inventory.findIndex(product => product.id === productId);

      if (rowIndex === -1) throw new Error('Product not found');

      const range = `Inventory!A${rowIndex + 2}:J${rowIndex + 2}`;
      const values = [[
        productId,
        updates.name || inventory[rowIndex].name,
        updates.description || inventory[rowIndex].description,
        updates.price || inventory[rowIndex].price,
        updates.quantity || inventory[rowIndex].quantity,
        updates.category || inventory[rowIndex].category,
        updates.thc_content || inventory[rowIndex].thc_content,
        updates.cbd_content || inventory[rowIndex].cbd_content,
        updates.strain_type || inventory[rowIndex].strain_type,
        new Date().toISOString()
      ]];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });

      return true;
    } catch (error) {
      console.error('Error updating product in Google Sheets:', error);
      throw error;
    }
  }
}

export const sheetsService = new SheetsService();
import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');
        // TIP: change image_url 'localhost' to the IP address when testing the mobile app

        const serializedItems = items.map(item => {
            const { id, image, title } = item;
            return {
                id,
                image_url: `http://localhost:3333/uploads/${image}`,
                title,
            };
        });

        return response.json(serializedItems);
    }
}

export default ItemsController;
import { Request, Response  } from 'express';
import knex from '../database/connection';

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        // TIP: change image_url 'localhost' to the IP address when testing the mobile app
        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`,
            };
        });

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if (!point) {
            return response.status(400).json({ message: 'Point not found.' });
        }

        /*
        * SELECT * FROM items
        *   JOIN point_items ON items.id = point_items.item_id
        *  WHERE point_items.point_id = {id}
        */

        // TIP: change image_url 'localhost' to the IP address when testing the mobile app
        const serializedPoint = {
            ...point,
            image_url: `http://localhost:3333/uploads/${point.image}`,
        };

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.json({ point: serializedPoint, items });
    }

    async create(request: Request, response: Response) {
        const {
            city,
            email,
            items,
            latitude,
            longitude,
            name,
            uf,
            whatsapp
        } = request.body;

        // Transaction to abort the first insertion if an error occurs during the second insertion
        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            city,
            email,
            latitude,
            longitude,
            name,
            uf,
            whatsapp
        }

        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0];

        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    item_id,
                    point_id
                }
        });

        await trx('point_items').insert(pointItems);

        // commit the inserts to the database
        await trx.commit();

        return response.json({
            id: point_id,
            ...point
         });
    }
}

export default PointsController;
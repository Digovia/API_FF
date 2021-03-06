import { db } from "../../database/connection";
import { Token } from "../../entities/Token";
import { User } from "../../entities/User";
//import { Users } from "../../entities/Users";
import { IUserRepository } from "../IUserRepository";
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export class MysqlUserRepository implements IUserRepository {
    async findUserbyemail(email: string): Promise<User> {
        try {
            const result = await db('user').where('email', email);

            return new User(result[0]);
        } catch (err) {
            throw new Error(err);
        }
    }


    async createUser(user: User): Promise<User> {
    
        const {
            email,
            name,
            password
        } = user;
    
        const trx = await db.transaction();

        try {
            
            await trx('user').insert({
                email,
                name,
                password
            });

            trx.commit();

            return user;
        } catch (err) {
            throw new Error(err);
        }
    };

    async readUser(): Promise<User> {

        try {
            
            const data = await db('user');

            return new User(data);

        } catch (err) {
            throw new Error(err);
        }
    };

    async updateUser(user: User): Promise<number | Error> {

        const {
            id,
            email,
            name,
            password
        } = user;

        try {
            
            const trx = await db.transaction();

            await trx('user').update({
                email,
                name,
                password
            }).where('id', id);


            trx.commit();

            return 1;
        } catch (err) {
            throw new Error(err);
        }
    };

    async deleteUser(user: User): Promise<number | Error> {
        
        const { id } = user;
        
        const trx = await db.transaction();

        try {
            
            await trx('user').update({
                status: 0
            }).where('id', id);

            trx.commit();

            return 1;
        } catch (err) {
            throw new Error(err);
        }
    };

    async createToken(user: User): Promise<Token> {
        const result = { token: '' };
        (user)
         result.token = jwt.sign({ user }, process.env.SECRET_STRING, {
            expiresIn: 28800
        });
        (result)


        return new Token(result);
    };

    async loginUser(user: User): Promise<User | number> {

        const {
            email,
            password
        } = user;

        try {
            const data = await db('user').where('email', email).andWhere('password', password).limit(1);

            if (!data.length) 
                return 0

            const users = new User(data[0]);

            return users;
        } catch (err) {
            throw new Error(err);
        }
    }

    async deleteToken(token: Token): Promise<void> {
        try {

            await db('blackList').insert({
                token: token.token
            });

            return;
        } catch (err) {
            throw new Error(err);
        }
    };
}
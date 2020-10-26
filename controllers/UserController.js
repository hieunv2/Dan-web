const helpers = require('./../common/helpers');
const User = require('./../models/User');

const mongoose = require('mongoose');

class UserController {

    // GET /user
    async index (req, res) {
        try {
            const selectParams = {
                _id: 1,
                name: 1,
            };

            const users = await User.getAll({}, selectParams);

            return helpers.success(res, users);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // POST /user
    async create (req, res, param, postData) {
        postData = JSON.parse(postData);

        let { name, email} = postData;

        try {
    
            const user = await User.create({ name, email});

            return helpers.success(res, user);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, error);
            }
            else {
                return helpers.error(res);
            }
        }
    }

    // GET /user/:id
    async show (req, res, param) {
        try {
            const aggPipeline = [
                {
                    "$match" : {
                        "_id" : mongoose.Types.ObjectId(param)
                    }
                },
                {
                    "$project" : {
                        "_id" : 1,
                        "name" : 1,
                        "email": 1
                    }
                }
            ];

            const user = await User.aggregation(aggPipeline);

            return helpers.success(res, user);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }

    // PUT /user/:id
    async update (req, res, param, postData) {
        param = mongoose.Types.ObjectId(param);

        let user;
        try {
            user = await User.get({ _id: param }, { _id: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!user) {
            return helpers.error(res, 'Entity not found', 404);
        }

        let updateData = {};
        postData = JSON.parse(postData);

        if (postData.name) {
            updateData.name = postData.name;
        }
        if(postData.email) {
            updateData.email = postData.email;
        }

        try {
            const options = {
                fields: {
                    name: 1,
                    email: 1
                },
                new: true
            };

            const user = await User.findOneAndUpdate({ _id: param }, {$set: updateData}, options);

            return helpers.success(res, user);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                return helpers.validationError(res, error);
            }
            else {
                console.log(error);
                return helpers.error(res);
            }
        }
    }

    // DELETE /employee/:id
    async delete (req, res, param) {
        param = mongoose.Types.ObjectId(param);

        let user;
        try {
            user = await User.get({ _id: param }, { _id: 1 });
        }
        catch (e) {
            console.log(e);
        }

        if (!user) {
            return helpers.error(res, 'Entity not found', 404);
        }

        try {
            let conditions = { _id: param };

            await User.remove(conditions);

            return helpers.success(res);
        }
        catch (error) {
            return helpers.error(res, error);
        }
    }
}

module.exports = new UserController();

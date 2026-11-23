const express = require('express');
const { User } = require('../models');

const router = express.Router();

// 1. 유저 생성 (POST /user/create)
router.post('/create', async (req, res, next) => {
    try {
        const user = await User.create({
            id: req.body.id,
            name: req.body.name,
            description: req.body.description || ''
        });
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

// 2. 전체 유저 조회 (GET /user)
router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

// 3. 특정 유저 상세 조회 (GET /user/:id)
router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id } });
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

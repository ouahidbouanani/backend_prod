"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const passport = require('passport');
const router = express.Router();
router.get('/auth/microsoft', passport.authenticate('azure_ad_oauth2'));
router.get('/auth/microsoft/callback', passport.authenticate('azure_ad_oauth2', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:5173/profile');
});
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('http://localhost:5173/');
    });
});
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    }
    else {
        res.status(401).json({ error: 'Non authentifié' });
    }
});
exports.default = router;

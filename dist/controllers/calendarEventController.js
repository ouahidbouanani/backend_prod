"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvents = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const formatEventForClient = (e) => ({
    id: e.id.toString(),
    title: e.title,
    // on renvoie "YYYY-MM-DD" à FullCalendar
    start: e.startDate.toISOString().split('T')[0],
    end: e.endDate ? e.endDate.toISOString().split('T')[0] : undefined,
    extendedProps: {
        calendar: e.color,
    },
});
const getEvents = async (req, res) => {
    try {
        const events = await prisma_1.default.calendarevent.findMany({
            orderBy: { startDate: 'asc' },
        });
        res.json(events.map(formatEventForClient));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
    }
};
exports.getEvents = getEvents;
const createEvent = async (req, res) => {
    try {
        const { title, start, end, extendedProps } = req.body;
        const color = extendedProps?.calendar || 'Primary';
        const event = await prisma_1.default.calendarevent.create({
            data: {
                title,
                // start et end sont envoyés en "YYYY-MM-DD" → new Date() OK
                startDate: new Date(start),
                endDate: end ? new Date(end) : null,
                color,
            },
        });
        res.status(201).json(formatEventForClient(event));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création' });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, start, end, extendedProps } = req.body;
        const color = extendedProps?.calendar || 'Primary';
        const event = await prisma_1.default.calendarevent.update({
            where: { id },
            data: {
                title,
                startDate: new Date(start),
                endDate: end ? new Date(end) : null,
                color,
            },
        });
        res.json(formatEventForClient(event));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma_1.default.calendarevent.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};
exports.deleteEvent = deleteEvent;

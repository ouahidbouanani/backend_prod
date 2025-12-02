import { Request, Response } from 'express';
import prisma from '../config/prisma';

const formatEventForClient = (e: any) => ({
  id: e.id.toString(),
  title: e.title,
  // on renvoie "YYYY-MM-DD" à FullCalendar
  start: e.startDate.toISOString().split('T')[0],
  end: e.endDate ? e.endDate.toISOString().split('T')[0] : undefined,
  extendedProps: {
    calendar: e.color,
  },
});

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { startDate: 'asc' },
    });

    res.json(events.map(formatEventForClient));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, start, end, extendedProps } = req.body;

    const color = extendedProps?.calendar || 'Primary';

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        // start et end sont envoyés en "YYYY-MM-DD" → new Date() OK
        startDate: new Date(start),
        endDate: end ? new Date(end) : null,
        color,
      },
    });

    res.status(201).json(formatEventForClient(event));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, start, end, extendedProps } = req.body;

    const color = extendedProps?.calendar || 'Primary';

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        startDate: new Date(start),
        endDate: end ? new Date(end) : null,
        color,
      },
    });

    res.json(formatEventForClient(event));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.calendarEvent.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

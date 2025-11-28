import { Router } from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/calendarEventController';

const router = Router();

router.get('/calendar/events', getEvents);
router.post('/calendar/events', createEvent);
router.put('/calendar/events/:id', updateEvent);
router.delete('/calendar/events/:id', deleteEvent);

export default router;

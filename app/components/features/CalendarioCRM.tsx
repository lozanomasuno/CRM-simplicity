"use client";
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarioCRM = () => {
  return (
    <div className="h-175 w-full bg-white dark:bg-mouse-gray p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl mt-8">
      <Calendar
        localizer={localizer}
        events={[]} // Aquí conectarás tus eventos del CRM
        startAccessor="start"
        endAccessor="end"
        className="text-gray-800 dark:text-gray-200"
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día"
        }}
        // Estilos personalizados para que combine con nuestro "Verde Luminoso"
        eventPropGetter={() => ({
          className: "bg-neon-green-light text-mouse-gray font-bold border-none rounded-lg"
        })}
      />
    </div>
  );
};

export default CalendarioCRM;
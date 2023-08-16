"use client";

import { CustomFlowbiteTheme, Table } from "flowbite-react";
import React from "react";
import CalendarDateBox from "./calendar-date-box";

const customTableTheme: CustomFlowbiteTheme['table'] = {
    root: {
        base: 'min-w-full text-left text-sm text-gray-500 dark:text-gray-400',
        shadow: "absolute bg-white dark:bg-black h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
        wrapper: "relative"
    },

};

const CalendarMonthView = () => {
  return (
    <div id="cal-month" className="overflow-x-auto">
      <Table theme={ customTableTheme }>
        <Table.Head>
          <Table.HeadCell>Monday</Table.HeadCell>
          <Table.HeadCell>Tuesday</Table.HeadCell>
          <Table.HeadCell>Wednesday</Table.HeadCell>
          <Table.HeadCell>Thursday</Table.HeadCell>
          <Table.HeadCell>Friday</Table.HeadCell>
          <Table.HeadCell>Saturday</Table.HeadCell>
          <Table.HeadCell>Sunday</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
            <Table.Cell>
              <CalendarDateBox />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
};

export default CalendarMonthView;

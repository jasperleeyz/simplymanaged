"use client";

import { Button, Dropdown } from "flowbite-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../configs/constants";
import { HiDotsHorizontal } from "react-icons/hi";
import DeleteSchedulePrompt from "../../../modules/schedule/manager/delete-schedule-prompt";
import React from "react";

type IProps = {
  date?: moment.Moment;
  schedule?: any;
};

const ScheduleDateBox = ({
  date = moment(new Date()),
  schedule = null,
}: IProps) => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = React.useState(false);
  const modalProps = { openModal, setOpenModal, schedule };

  return (
    <>
      <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
        <div className="flex items-center justify-between">
          <p>{date.date()}</p>
          {schedule && (
            <div className="rounded-full">
              <Dropdown label={<HiDotsHorizontal />} arrowIcon={false} inline>
                <Dropdown.Item
                  onClick={() => {
                    navigate(`./${PATHS.VIEW_SCHEDULE}`, {
                      state: { schedule },
                    });
                  }}
                >
                  View
                </Dropdown.Item>
                {date.isAfter(moment(new Date())) && (
                  <>
                    <Dropdown.Item
                      onClick={() => {
                        navigate(`./${PATHS.EDIT_SCHEDULE}`, {
                          state: { schedule },
                        });
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setOpenModal((prev) => true);
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown>
            </div>
          )}
        </div>
        <br />
        {!schedule && (
          <div className="relative">
            <p className="absolute whitespace-normal">No schedule available</p>
            {date.isAfter(moment(new Date())) && (
              <Button
                size="sm"
                className="absolute hidden group-hover:block"
                color="info"
                onClick={() => {
                  navigate(`./${PATHS.CREATE_SCHEDULE}`, {
                    state: { date: date.toDate() },
                  });
                }}
              >
                Add schedule
              </Button>
            )}
          </div>
        )}
        {schedule && (
          <div className="relative">
            {/* <p className="absolute whitespace-normal">No schedule for the day</p>
        <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
            <div className="bg-green-300 rounded p-1">
              <p>Schedule available</p>
            </div>
          </div>
        )}
      </div>
      {schedule && <DeleteSchedulePrompt {...modalProps} />}
    </>
  );
};

export default ScheduleDateBox;

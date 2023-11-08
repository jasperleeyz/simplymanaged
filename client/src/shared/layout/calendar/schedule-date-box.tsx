"use client";
import { useContext } from "react";
import { Button, Dropdown } from "flowbite-react";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { PATHS, ROLES } from "../../../configs/constants";
import { HiDotsHorizontal } from "react-icons/hi";
import DeleteSchedulePrompt from "../../../modules/schedule/manager/delete-schedule-prompt";
import React from "react";

type IProps = {
  date?: moment.Moment;
  roster?: any;
};

const ScheduleDateBox = ({
  date = moment(new Date()),
  roster = null,
}: IProps) => {
  const navigate = useNavigate();

  const { globalState } = useContext(GlobalStateContext);

  const [openModal, setOpenModal] = React.useState(false);
  const modalProps = { openModal, setOpenModal, roster };

  return (
    <div>
      {globalState?.user?.role === ROLES.MANAGER ? (
        <div>
          <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
            <div className="flex items-center justify-between">
              <p>{date.date()}</p>
              {roster && (
                <div className="rounded-full">
                  <Dropdown
                    label={<HiDotsHorizontal />}
                    arrowIcon={false}
                    inline
                  >
                    <Dropdown.Item
                      onClick={() => {
                        navigate(`./${PATHS.VIEW_SCHEDULE}`, {
                          state: { roster },
                        });
                      }}
                    >
                      View
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              )}
            </div>
            <br />
            {!roster && (
              <div className="relative">
                <p className="absolute whitespace-normal">
                  No schedule available
                </p>
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
            {roster && (
              <div className="relative">
                {/* <p className="absolute whitespace-normal">No schedule for the day</p>
        <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
                {date.isAfter(moment(new Date())) ?(
                <div className="bg-green-300 rounded p-1">
                <p>Schedule available</p>
                </div>
              ):(
                <div className="bg-red-300 rounded p-1">
                <p>Schedule ended</p>
                </div>
              )}
              </div>
            )}
          </div>
          {roster && <DeleteSchedulePrompt {...modalProps} />}
        </div>
      ) : (
        <div>
        <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
          <div className="flex items-center justify-between">
            <p>{date.date()}</p>
            {roster && (
              <div className="rounded-full">
                <Dropdown
                  label={<HiDotsHorizontal />}
                  arrowIcon={false}
                  inline
                >
                  <Dropdown.Item
                    onClick={() => {
                      navigate(`./${PATHS.VIEW_SCHEDULE}`, {
                        state: { roster },
                      });
                    }}
                  >
                    Bid
                  </Dropdown.Item>
                </Dropdown>
              </div>
            )}
          </div>
          <br />
          {!roster && (
            <div className="relative">
              <p className="absolute whitespace-normal">
                No schedule available
              </p>
            </div>
          )}
          {roster && (
            <div className="relative">
              {/* <p className="absolute whitespace-normal">No schedule for the day</p>
      <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
              {date.isAfter(moment(new Date())) ?(
                <div className="bg-green-300 rounded p-1">
                <p>Schedule available</p>
                </div>
              ):(
                <div className="bg-red-300 rounded p-1">
                <p>Schedule ended</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ScheduleDateBox;

import moment from "moment";
import { useNavigate } from "react-router-dom";
import { IRoster, IUserSchedule } from "../../model/schedule.model";
import React from "react";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { HiDotsHorizontal } from "react-icons/hi";
import { Dropdown } from "flowbite-react";
import { PATHS } from "../../../configs/constants";

type IProps = {
  date?: moment.Moment;
  schedule?: IUserSchedule | null;
};

const PersonalDateBox = ({
  date = moment(new Date()),
  schedule = null,
}: IProps) => {
  const navigate = useNavigate();
  const user = React.useContext(GlobalStateContext).globalState?.user;
  const rosterType = schedule?.roster?.type;
  const [roster, setRoster] = React.useState<IRoster | null>({} as any);

  /*React.useEffect(() => {
    if(schedule) {
      // TODO: retrieve roster based on roster id
      getRosterById(user?.company_id || 0, schedule.roster_id)
        .then((res) => {
          setRoster(res.data);
        })
        .catch((err) => {
          toast.error("Error getting roster information", { toastId: "personal-schedule-roster"});
        });
    }

  }, []);
  */
  return (
    <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
      <div className="flex items-center justify-between">
        <p>{date.date()}</p>
        <div className="rounded-full">
          {moment(schedule?.start_date).isAfter(new Date()) && (
            <Dropdown label={<HiDotsHorizontal />} arrowIcon={false} inline>
              <Dropdown.Item
                onClick={() => {
                  navigate(`/${PATHS.SCHEDULE}/${PATHS.VIEW_PERSONAL_SCHEDULE}`, {
                    state: { schedule },
                  });
                }}
              >
                View
              </Dropdown.Item>
              {rosterType === "SHIFT" && (
                <Dropdown.Item
                  onClick={() => {
                    navigate(`/${PATHS.REQUESTS}/${PATHS.ADD_SWAP_REQUEST}`, {
                      state: { schedule },
                    });
                  }}
                >
                  Swap
                </Dropdown.Item>
              )}
            </Dropdown>
          )}
        </div>
      </div>
      <br />
      {!schedule && (
        <div className="relative">
          <p className="absolute whitespace-normal">No schedule for the day</p>
        </div>
      )}
      {date.isAfter(moment(new Date())) && schedule ? (
        <div>
          <div className="bg-green-300 rounded p-1">
            <p className="font-bold text-sm text-black">
              {schedule.roster?.location?.name}
            </p>
            <p className="font-bold text-sm text-black">
              {schedule?.roster?.type}
            </p>
            {/* <p className="font-bold text-sm text-black">{schedule?.status}</p> */}
          </div>
        </div>
      ) : date.isBefore(moment(new Date())) && schedule ? (
        <div>
          <div className="bg-red-300 rounded p-1">
            <p className="font-bold text-sm text-black">
              {schedule.roster?.location?.name}
            </p>
            <p className="font-bold text-sm text-black">
              {schedule?.roster?.type}
            </p>
            {/* <p className="font-bold text-sm text-black">{schedule?.status}</p> */}
          </div>
        </div>
      ) : (
        <div>{}</div>
      )}
    </div>
  );
};

export default PersonalDateBox;

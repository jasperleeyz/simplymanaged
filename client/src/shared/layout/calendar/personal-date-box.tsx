import moment from "moment";
import { useNavigate } from "react-router-dom";
import { IRoster, IUserSchedule } from "../../model/schedule.model";
import React from "react";
import { GlobalStateContext } from "../../../configs/global-state-provider";
import { getRosterById } from "../../api/roster.api";
import { HiDotsHorizontal } from "react-icons/hi";
import { Dropdown } from "flowbite-react";
import { toast } from "react-toastify";
import { Label } from "flowbite-react";

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
          {rosterType === "SHIFT" && (
            <Dropdown label={<HiDotsHorizontal />} arrowIcon={false} inline>
              <Dropdown.Item
                onClick={() => {
                  console.log("Swap clicked");
                }}
              >
                Swap
              </Dropdown.Item>
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
      {schedule && (
        <div>
          {/* <p className="absolute whitespace-normal">No schedule for the day</p>
        <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
          <div className="bg-green-300 rounded p-1">
            <Label>{schedule.roster?.location?.name}</Label>
            <Label>{schedule?.roster?.type}</Label>
            <Label>{schedule?.status}</Label>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDateBox;

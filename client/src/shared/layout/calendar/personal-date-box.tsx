import moment from "moment";
import { useNavigate } from "react-router-dom";

type IProps = {
  date?: moment.Moment;
  schedule?: any;
};

const PersonalDateBox = ({
  date = moment(new Date()),
  schedule = null,
}: IProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-[110px] h-[110px] max-w-sm max-h-sm group">
      <p>{date.date()}</p>
      <br />
      {!schedule && (
        <div className="relative">
          <p className="absolute whitespace-normal">No schedule for the day</p>
        </div>
      )}
      {schedule && (
        <div className="relative">
          {/* <p className="absolute whitespace-normal">No schedule for the day</p>
        <Button size="sm" className='absolute hidden group-hover:block' color="info">Add schedule</Button> */}
        </div>
      )}
    </div>
  );
};

export default PersonalDateBox;

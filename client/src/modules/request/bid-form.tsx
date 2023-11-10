import React from "react";
import * as Yup from "yup";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Label, Button, Modal } from "flowbite-react";
import { Formik } from "formik";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { DATE, PATHS } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import { IRoster } from "../../shared/model/schedule.model";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { getAllLocations } from "../../shared/api/location.api";
import { ICompanyLocation } from "../../shared/model/company.model";
import { createBidRequest } from "../../shared/api/request.api";
import { checkWorkingHours } from "../../shared/api/user.api";

const validationSchema = Yup.object().shape({
  roster_id: Yup.string().required("Field is required"),
  request_shift: Yup.string().required("Field is required"),
});

const BidForm = () => {
  const user = React.useContext(GlobalStateContext)?.globalState?.user;
  const navigate = useNavigate();
  const location = useLocation();
  const [initialValues, setInitialValues] = React.useState<any>({
    roster_id: "",
    request_shift: "",
  });
  const [roster, setRoster] = React.useState<IRoster | undefined>(undefined);
  const [rosters, setRosters] = React.useState<IRoster[]>([]);
  const [locations, setLocations] = React.useState<ICompanyLocation[]>([]);
  const [showPrompt, setShowPrompt] = React.useState<boolean>(false);
  const [resolver, setResolver] = React.useState<any>(undefined);

  const generateShiftOptions = (
    user_schedule: any,
    positions: any,
    user_pos: string
  ) => {
    const employeePositionsCount = {};

    user_schedule.forEach((schedule: any) => {
      if (employeePositionsCount[schedule.user.position]) {
        employeePositionsCount[schedule.user.position]["count"] +=
          schedule.shift.toUpperCase() === "FULL" ? 1 : 0.5;
        if (employeePositionsCount[schedule.user.position][schedule.shift])
          employeePositionsCount[schedule.user.position][schedule.shift] += 1;
        else employeePositionsCount[schedule.user.position][schedule.shift] = 1;
      } else {
        employeePositionsCount[schedule.user.position] = {};
        employeePositionsCount[schedule.user.position]["count"] =
          schedule.shift.toUpperCase() === "FULL" ? 1 : 0.5;
        employeePositionsCount[schedule.user.position][schedule.shift] = 1;
      }
    });

    positions.forEach((position: any) => {
      employeePositionsCount[position.position]["count"] =
        position.count - employeePositionsCount[position.position]["count"];
    });

    let shifts = [] as string[];

    if (employeePositionsCount[user_pos]["count"] === 0.5) {
      if (
        employeePositionsCount[user_pos]["AM"] <
        employeePositionsCount[user_pos]["PM"]
      ) {
        shifts = ["AM"];
      } else {
        shifts = ["PM"];
      }
    } else if (employeePositionsCount[user_pos]["count"] >= 1) {
      shifts = ["FULL", "AM", "PM"];
    }

    return (
      <>
        {shifts.map((shift: string, idx: number) => (
          <option key={idx} value={shift}>
            {shift}
          </option>
        ))}
      </>
    );
  };

  const promptUser = async () =>
    new Promise((resolve, reject) => {
      setShowPrompt((prev) => !prev);
      setResolver((prev) => resolve);
    });

  React.useEffect(() => {
    // navigate user back to schedule page if no roster is found
    if (!location.state?.roster) {
      toast.error("No schedule selected", { toastId: "no-schedule-selected" });
      navigate(`/${PATHS.SCHEDULE}`);
    } else {
      setRosters(location.state.roster);
      getAllLocations(user?.company_id || 0).then((res) => {
        setLocations(res.data);
      });
      if (location.state?.roster.length === 1) {
        setRoster(location.state?.roster[0]);
        setInitialValues({
          roster_id: location.state?.roster[0].id,
          request_shift: "",
        });
      }
    }
  }, []);

  return (
    <div>
      <p className="header">Shift Bid Request</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitting(true);
            await checkWorkingHours(roster?.start_date).then(async (res) => {
              if (
                res.data.currentWeekWorkingHours +
                  (values.request_shift === "FULL" ? 8 : 4) >
                res.data.workingHoursPerWeek
              ) {
                // prompt user to confirm
                await promptUser().then((res2) => {
                  if(res2 === "NO") return;
                  else {
                    createBidRequest(values).then((res3) => {
                      toast.success("Bid request created successfully");
                      navigate(-1);
                    });
                  }
                });
              } else {
                createBidRequest(values).then((res2) => {
                  toast.success("Bid request created successfully");
                  navigate(-1);
                });
              }
            });
          } catch (err) {
            toast.error(err as string);
            if ((err as string).includes("filled")) {
              navigate(-1);
            }
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={validationSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <Label htmlFor="roster-details">Available Rosters</Label>
              <div
                id="roster-details"
                className="border border-black mb-3 px-3"
              >
                {rosters.map((ros, idx) => (
                  <div key={idx} className="grid grid-cols-3 items-center">
                    <LabeledField
                      id="roster-date"
                      name="roster-date"
                      labelValue="Date"
                      value={moment(ros?.start_date).format(
                        DATE.MOMENT_DDMMYYYY
                      )}
                      readOnly
                    />
                    <LabeledField
                      id="roster-location"
                      name="roster-location"
                      labelValue="Location"
                      value={
                        locations
                          ? locations.find((loc) => loc.id === ros.location_id)
                              ?.name || "N/A"
                          : "N/A"
                      }
                      readOnly
                    />
                    <Button
                      size="sm"
                      color="info"
                      className="col-span-1 justify-self-center"
                      onClick={() => {
                        setRoster(ros);
                        props.setFieldValue("roster_id", ros.id);
                      }}
                      disabled={roster?.id === ros.id}
                    >
                      {roster?.id === ros.id ? "Selected" : "Select"}
                    </Button>
                    {idx + 1 !== rosters.length ? (
                      <hr className="col-span-3" />
                    ) : null}
                  </div>
                ))}
              </div>
              <LabeledSelect
                id="request-shift"
                name="request_shift"
                labelValue="Shift Available for Selection"
                value={props.values.request_shift}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.request_shift && props.touched.request_shift
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.request_shift && props.touched.request_shift ? (
                    <>{props.errors.request_shift}</>
                  ) : null
                }
              >
                <option value={""}>Select shift for bidding</option>
                {roster
                  ? generateShiftOptions(
                      roster?.schedules,
                      roster?.positions,
                      user?.position || ""
                    )
                  : null}
              </LabeledSelect>
            </div>
            <div className="flex justify-end gap-3 mt-12">
              <BackButton
                size="sm"
                color="light"
                disabled={props.isSubmitting}
              />
              <Button
                size="sm"
                type="submit"
                disabled={props.isSubmitting}
                isProcessing={props.isSubmitting}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
      {showPrompt ? (
        <Modal
          id="bid-request-confirmation-modal"
          show={true}
          dismissible
          onClose={() => {
            setShowPrompt(false);
            resolver("NO");
          }}
        >
          <Modal.Header>Bid Request Confirmation</Modal.Header>
          <Modal.Body>
            <p>
              Working on this schedule will exceed your weekly working hours.
            </p>
            <p>Are you sure you want to submit this request?</p>
          </Modal.Body>
          <Modal.Footer className="justify-end">
            <Button
              size="sm"
              color="light"
              disabled={false}
              onClick={() => {
                setShowPrompt(false);
                resolver("NO");
              }}
            >
              No
            </Button>
            <Button
              size="sm"
              color="info"
              disabled={false}
              onClick={() => {
                setShowPrompt(false);
                resolver("YES");
              }}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      ) : null}
    </div>
  );
};

export default BidForm;

import { useNavigate, useParams } from "react-router-dom";
import { ICompanyLocation } from "../../shared/model/company.model";
import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { PATHS } from "../../configs/constants";
import { toast } from "react-toastify";
import BackButton from "../../shared/layout/buttons/back-button";
import { Button } from "flowbite-react";
import { Formik } from "formik";
import LabeledTextInput from "../../shared/layout/form/labeled-text-input";
import * as Yup from "yup";
import { createUpdateLocation, getAllLocations } from "../../shared/api/location.api";

const LocationSchema = Yup.object().shape({
  name: Yup.string().required("Field is required"),
  address: Yup.string().required("Field is required"),
});

const AddOrEditLocation = () => {
  const navigate = useNavigate();
  const id = useParams()?.id;
  const logged_in_user =
    React.useContext(GlobalStateContext)?.globalState?.user;

  const [initialValues, setInitialValues] = React.useState<ICompanyLocation>({
    id: 0,
    company_id: logged_in_user?.company_id || 0,
    name: "",
    address: "",
  });

  React.useEffect(() => {
    if (id) {
      // get location by id
      getAllLocations(
        logged_in_user?.company_id || 0,
        undefined,
        undefined,
        undefined,
        `equals(id,${id})`
      )
        .then((res) => {
          setInitialValues(res.data[0]);
        })
        .catch((err) => {
          toast.error(err, { toastId: id });
          navigate(`/${PATHS.LOCATION}`);
        });
    }
  }, []);

  return (
    <div>
      <p className="header">{`${!id ? "Add" : "Edit"} Location`}</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          try {
            await createUpdateLocation(values).then(() => {
              toast.success(`Location ${!id ? "created" : "updated"} successfully`);
              navigate(`..`);
            });
          } catch (err) {
            toast.error(
              `Error ${
                !id ? "creating new" : "updating"
              } location. Please try again later.`
            );
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={LocationSchema}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} className="md:w-1/2 mx-auto">
            <div>
              <LabeledTextInput
                id="location-name"
                name="name"
                labelValue="Name"
                value={props.values.name?.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.name && props.touched.name
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.name &&
                  props.touched.name ? (
                    <>{props.errors.name}</>
                  ) : null
                }
              />
              <LabeledTextInput
                id="location-address"
                name="address"
                labelValue="Address"
                value={props.values.address?.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.address && props.touched.address
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.address &&
                  props.touched.address ? (
                    <>{props.errors.address}</>
                  ) : null
                }
              />
            </div>
            <div className="flex justify-end mt-12 gap-3">
              <BackButton size="sm" color="light" />
              <Button
                type="submit"
                size="sm"
                disabled={props.isSubmitting}
                isProcessing={props.isSubmitting}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddOrEditLocation;

import * as Yup from "yup";
import { Formik } from "formik";
import LabeledInputText from "../../shared/layout/form/labeled-text-input";
import { Button, Card } from "flowbite-react";
import LabeledSelect from "../../shared/layout/form/labeled-select";
import React from "react";
import {
  IApplicationCode,
  ISubscriptionModel,
} from "../../shared/model/application.model";
import { toast } from "react-toastify";
import { submitRegistration } from "../../shared/api/registration.api";
import { IRegistration } from "../../shared/model/company.model";
import { getCodesForRegistration } from "../../shared/api/code.api";
import { getAllSubscriptionModels } from "../../shared/api/subscription.api";

const RegistrationSchema = (
  employeesList: IApplicationCode[],
  industryList: IApplicationCode[],
  subscriptionModelList: ISubscriptionModel[],
) =>
  Yup.object().shape({
    company_name: Yup.string().required("Field is required"),
    industry: Yup.string()
      .required("Field is required")
      .test("within-list", "Invalid option", (value) =>
        industryList.find((v) => v.code === value) ? true : false
      ),
    uen_id: Yup.string()
      .min(9, "Please enter a valid UEN")
      .max(10, "Please enter a valid UEN")
      .matches(
        /^([0-9]{8}[A-Z]{1}|[0-9]{9}[A-Z]{1}|[A-Z]{1}[0-9]{2}[A-Z]{2}[0-9]{4}[A-Z]{1})+$/,
        "Please enter a valid UEN"
      )
      .required("Field is required"),
    registrant_name: Yup.string().required("Field is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Field is required"),
    contact_no: Yup.string()
      .matches(/^\d{8}$/, "Contact number must be 8 digits")
      .required("Field is required"),
    address: Yup.string().required("Field is required"),
    no_of_employees: Yup.string()
      .required("Field is required")
      .test("within-list", "Invalid option", (value) =>
        employeesList.find((v) => Number(v.code) === Number(value))
          ? true
          : false
      ),
  });

const RegistrationForm = () => {
  const [noOfEmployees, setNoOfEmployees] = React.useState<IApplicationCode[]>(
    []
  );
  const [industryList, setIndustryList] = React.useState<IApplicationCode[]>(
    []
  );
  const [subscriptionModelList, setSubscriptionModelList] = React.useState<
    ISubscriptionModel[]
  >([]);

  React.useEffect(() => {
    Promise.all([
      getCodesForRegistration().then((res) => {
        setNoOfEmployees(res.data.no_of_employees);
        setIndustryList(res.data.industry);
      }),
      getAllSubscriptionModels().then((res) =>
        setSubscriptionModelList(res.data)
      ),
    ]).catch((err) =>
      toast.error("Error retrieving data from server. Please try again later", {
        toastId: "registration-form",
      })
    );
  }, []);

  return (
    <div className="md:w-1/2 mx-auto">
      <Card>
        <p className="header">Registration</p>
        <Formik
          initialValues={{
            id: 0,
            uen_id: "",
            company_name: "",
            industry: "",
            registrant_name: "",
            email: "",
            contact_no: "",
            address: "",
            no_of_employees: "",
            subscription_model: "",
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              await submitRegistration({
                ...values,
                contact_no: Number(values.contact_no),
                no_of_employees: Number(values.no_of_employees),
              } as IRegistration).then(() => {
                toast.success("Registration submitted successfully");
                resetForm();
              });
            } catch (err) {
              console.error(err);
              toast.error("Error encountered. Please try again later");
            } finally {
              setSubmitting(false);
            }
          }}
          validationSchema={RegistrationSchema(noOfEmployees, industryList, subscriptionModelList)}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <LabeledInputText
                id="uen"
                name="uen_id"
                labelValue="Unique Entity No. (UEN)"
                value={props.values.uen_id.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.uen_id && props.touched.uen_id
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.uen_id && props.touched.uen_id ? (
                    <>{props.errors.uen_id}</>
                  ) : (
                    <>We will be using this number to verify your company.</>
                  )
                }
              />
              <LabeledInputText
                id="company-name"
                name="company_name"
                labelValue="Company Name"
                value={props.values.company_name.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.company_name && props.touched.company_name
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.company_name && props.touched.company_name ? (
                    <>{props.errors.company_name}</>
                  ) : null
                }
              />
              <LabeledSelect
                id="industry"
                name="industry"
                labelValue="Industry"
                value={props.values.industry}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.industry && props.touched.industry
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.industry && props.touched.industry ? (
                    <>{props.errors.industry}</>
                  ) : null
                }
              >
                <option value="" />
                {/* get list of possible values and loop to create option */}
                {industryList.map((v, idx) => (
                  <option key={idx} value={v.code}>
                    {v.description}
                  </option>
                ))}
              </LabeledSelect>
              <LabeledInputText
                id="registrant-name"
                name="registrant_name"
                labelValue="Contact Person Name"
                value={props.values.registrant_name.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.registrant_name && props.touched.registrant_name
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.registrant_name &&
                  props.touched.registrant_name ? (
                    <>{props.errors.registrant_name}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="contact-number"
                name="contact_no"
                labelValue="Contact Number"
                value={props.values.contact_no}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.contact_no && props.touched.contact_no
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.contact_no && props.touched.contact_no ? (
                    <>{props.errors.contact_no}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="email"
                name="email"
                labelValue="Email"
                value={props.values.email.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.email && props.touched.email ? "failure" : "gray"
                }
                helperText={
                  props.errors.email && props.touched.email ? (
                    <>{props.errors.email}</>
                  ) : null
                }
              />
              <LabeledInputText
                id="address"
                name="address"
                labelValue="Address"
                value={props.values.address.toLocaleUpperCase()}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.address && props.touched.address
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.address && props.touched.address ? (
                    <>{props.errors.address}</>
                  ) : null
                }
              />
              <LabeledSelect
                id="no-of-employees"
                name="no_of_employees"
                labelValue="No. of Employees"
                value={props.values.no_of_employees}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.no_of_employees && props.touched.no_of_employees
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.no_of_employees &&
                  props.touched.no_of_employees ? (
                    <>{props.errors.no_of_employees}</>
                  ) : null
                }
              >
                <option value="" />
                {noOfEmployees.map((v, idx) => (
                  <option key={idx} value={v.code}>
                    {v.description}
                  </option>
                ))}
              </LabeledSelect>
              <LabeledSelect
                id="subscription-model"
                name="subscription_model"
                labelValue="Subscription"
                value={props.values.subscription_model}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.subscription_model && props.touched.subscription_model
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.subscription_model && props.touched.subscription_model ? (
                    <>{props.errors.subscription_model}</>
                  ) : null
                }
              >
                <option value="" />
                {/* get list of possible values and loop to create option */}
                {subscriptionModelList.map((v, idx) => (
                  <option key={idx} value={v.id}>
                    {`${v.name} (${v.payment_cycle}) - $${v.price}`}
                  </option>
                ))}
              </LabeledSelect>
              <div className="mt-8 flex justify-end">
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
      </Card>
    </div>
  );
};

export default RegistrationForm;

import * as Yup from "yup";
import { Formik } from "formik";
import LabeledInputText from "../../shared/layout/form/labeled-text-input";
import { Card, Label, Select, TextInput } from "flowbite-react";
import { isNumber } from "../../configs/utils";

const RegistrationSchema = (employeesList: number[]) => Yup.object().shape({
  companyName: Yup.string().required("Required"),
  industry: Yup.string().required("Required"),
  uen: Yup.string().required("Required"),
  contactPersonName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  contactNumber: Yup.string().matches(
    /^\d{8}$/,
    "Must be a number"
  ).required("Required"),
  address: Yup.string().required("Required"),
  noOfEmployees: Yup.number().required("Required").test({test: (v: number) => employeesList.includes(v), message: "Invalid number of employees"}),
});

const RegistrationForm = () => {

  const employeesList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="md:w-1/2 mx-auto">
      <Card>
        <p className="header">Registration</p>
        <Formik
          initialValues={{
            companyName: "",
            industry: "",
            contactPersonName: "",
            email: "",
            contactNumber: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
          }}
          onSubmit={(values, { setSubmitting }) => {}}
          validationSchema={RegistrationSchema(employeesList)}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <LabeledInputText
                id="company-name"
                name="companyName"
                labelValue="Company Name"
                value={props.values.companyName}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.companyName && props.touched.companyName
                    ? "failure"
                    : "gray"
                }
                helperText={
                  props.errors.companyName && props.touched.companyName ? (
                    <>{props.errors.companyName}</>
                  ) : null
                }
              />
              <div className="mb-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                    id="industry"
                    name="industry"
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
                    <option value="11">11</option>
                </Select>
              </div>
                <LabeledInputText
                    id="contact-person-name"
                    name="contactPersonName"
                    labelValue="Contact Person Name"
                    value={props.values.contactPersonName}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    color={
                        props.errors.contactPersonName && props.touched.contactPersonName
                            ? "failure"
                            : "gray"
                    }
                    helperText={
                        props.errors.contactPersonName && props.touched.contactPersonName ? (
                            <>{props.errors.contactPersonName}</>
                        ) : null
                    }
                />
                <LabeledInputText
                    id="contact-number"
                    name="contactNumber"
                    labelValue="Contact Number"
                    value={props.values.contactNumber}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    color={
                        props.errors.contactNumber && props.touched.contactNumber
                            ? "failure"
                            : "gray"
                    }
                    helperText={
                        props.errors.contactNumber && props.touched.contactNumber ? (
                            <>{props.errors.contactNumber}</>
                        ) : null
                    }
                />
            </form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default RegistrationForm;

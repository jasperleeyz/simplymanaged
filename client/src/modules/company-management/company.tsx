import React from "react";
import { GlobalStateContext } from "../../configs/global-state-provider";
import { ICompany } from "../../shared/model/company.model";
import { getCompanyById, updateCompany } from "../../shared/api/company.api";
import LabeledField from "../../shared/layout/fields/labeled-field";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { PATHS } from "../../configs/constants";
import { HiPencil, HiSave } from "react-icons/hi";
import LabeledInputText from "../../shared/layout/form/labeled-text-input";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as Yup from "yup";
import { IApplicationCode } from "../../shared/model/application.model";
import { getAllCodes } from "../../shared/api/code.api";
import LabeledSelect from "../../shared/layout/form/labeled-select";

const CompanyPage = () => {
  const companyId =
    React.useContext(GlobalStateContext)?.globalState?.user?.company_id;
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes(PATHS.EDIT_COMPANY);

  const [company, setCompany] = React.useState<ICompany>({} as ICompany);
  const [industries, setIndustries] = React.useState<IApplicationCode[]>([]);

  React.useEffect(() => {
    Promise.all([
      getCompanyById(companyId || 0).then((response) => {
        setCompany(response.data);
      }),
      getAllCodes(
        undefined,
        undefined,
        undefined,
        "equals(code_type,industry)"
      ).then((response) => {
        setIndustries(response.data);
      }),
    ]).catch((err) => {
      toast.error(`Error retrieving company details. Please try again later.`);
    });
  }, []);

  return (
    <div>
      {isEdit
        ? getForm(company, navigate, industries)
        : getBody(company, navigate, industries)}
    </div>
  );
};

export default CompanyPage;

const CompanySchema = (industryList: IApplicationCode[]) =>
  Yup.object().shape({
    uen: Yup.string().required("Field is required"),
    address: Yup.string().required("Field is required"),
    contact_no: Yup.string().required("Field is required"),
    email: Yup.string().email("Invalid email").required("Field is required"),
    name: Yup.string().required("Field is required"),
    industry: Yup.string()
      .test("within-list", "Invalid industry", (value) => {
        return industryList.some((industry) => industry.code === value);
      })
      .required("Field is required"),
  });

const getForm = (initialValues, navigate, industryList) => {
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        try {
          await updateCompany(values).then(() => {
            toast.success(`Company details updated successfully`);
            navigate(`..`);
          });
        } catch (err) {
          toast.error(
            `Error updating company details. Please try again later.`
          );
        } finally {
          setSubmitting(false);
        }
      }}
      validationSchema={CompanySchema(industryList)}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit}>
          <LabeledInputText
            name="name"
            labelValue="Company Name"
            value={props.values.name}
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            color={props.errors.name && props.touched.name ? "failure" : "gray"}
            helperText={
              props.errors.name && props.touched.name ? (
                <>{props.errors.name}</>
              ) : null
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center col-span-2">
              <p className="font-bold text-md">Company Details</p>
              <Button size="sm" type="submit">
                <HiSave className="mr-2 my-auto" />
                <p>Save</p>
              </Button>
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledInputText
                name="uen"
                labelValue="Unique Entity No. (UEN)"
                value={props.values.uen || "N/A"}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                color={
                  props.errors.uen && props.touched.uen ? "failure" : "gray"
                }
                helperText={
                  props.errors.uen && props.touched.uen ? (
                    <>{props.errors.uen}</>
                  ) : null
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledSelect
                name="industry"
                labelValue="Company Industry"
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
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledField
                name="no-of-employees"
                labelValue="Total No. of Employees"
                value={initialValues.actual_no_of_employees || "N/A"}
              />
            </div>
            <p className="font-bold text-md col-span-2 mt-4">Contact</p>
            <div className="col-span-2 md:col-span-1">
              <div className="col-span-2 md:col-span-1">
                <LabeledInputText
                  name="address"
                  labelValue="Company Address"
                  value={props.values.address}
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
              </div>
              <LabeledInputText
                name="contact_no"
                labelValue="Contact No."
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
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledInputText
                name="email"
                labelValue="Contact Email Address"
                value={props.values.email || "N/A"}
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
            </div>
            <p className="font-bold text-md col-span-2 mt-4">Subscription</p>
            <div className="col-span-2 md:col-span-1">
              <LabeledField
                name="company-subscription-type"
                labelValue="Subscription Type"
                value={
                  initialValues?.subscriptions
                    ? initialValues.subscriptions[0].type
                    : "N/A"
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledField
                name="company-subscription-member-limit"
                labelValue="Subscription Member Limit"
                value={
                  initialValues?.subscriptions
                    ? initialValues.subscriptions[0].employee_quantity
                    : "N/A"
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledField
                name="company-subscription-start-date"
                labelValue="Subscription Start Date"
                value={
                  initialValues?.subscriptions
                    ? initialValues.subscriptions[0].start_date
                    : "N/A"
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <LabeledField
                name="company-subscription-end-date"
                labelValue="Subscription Expiry Date"
                value={
                  initialValues?.subscriptions
                    ? initialValues.subscriptions[0].end_date
                    : "N/A"
                }
              />
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

const getBody = (company, navigate, industryList) => {
  return (
    <>
      <p className="header">{company.name}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between items-center col-span-2">
          <p className="font-bold text-md">Company Details</p>
          <Button size="sm" onClick={() => navigate(`./${PATHS.EDIT_COMPANY}`)}>
            <HiPencil className="mr-2 my-auto" />
            <p>Update Details</p>
          </Button>
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="uen"
            labelValue="Unique Entity No. (UEN)"
            value={company.uen || "N/A"}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="industry"
            labelValue="Company Industry"
            value={industryList.find((ind) => ind.code === company.industry)?.description || company.industry}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="no-of-employees"
            labelValue="Total No. of Employees"
            value={company.actual_no_of_employees || "N/A"}
          />
        </div>
        <p className="font-bold text-md col-span-2 mt-4">Contact</p>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="address"
            labelValue="Company Address"
            value={company.address}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="contact_no"
            labelValue="Contact No."
            value={company.contact_no || "N/A"}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="email"
            labelValue="Contact Email Address"
            value={company.email || "N/A"}
          />
        </div>
        <p className="font-bold text-md col-span-2 mt-4">Subscription</p>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="company-subscription-type"
            labelValue="Subscription Type"
            value={
              company?.subscriptions ? company.subscriptions[0].type : "N/A"
            }
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="company-subscription-member-limit"
            labelValue="Subscription Member Limit"
            value={
              company?.subscriptions
                ? company.subscriptions[0].employee_quantity
                : "N/A"
            }
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="company-subscription-start-date"
            labelValue="Subscription Start Date"
            value={
              company?.subscriptions
                ? company.subscriptions[0].start_date
                : "N/A"
            }
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <LabeledField
            name="company-subscription-end-date"
            labelValue="Subscription Expiry Date"
            value={
              company?.subscriptions ? company.subscriptions[0].end_date : "N/A"
            }
          />
        </div>
      </div>
    </>
  );
};

import { useContext, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStateContext } from "../../configs/global-state-provider";
import { Checkbox, Button, Label, TextInput, Select } from "flowbite-react";
import { capitalizeString, isNumber, validName, validEmail } from "../../configs/utils";
import { useNavigate } from "react-router-dom";
import { HiUserAdd } from "react-icons/hi"
import IUser from "../../shared/model/user.model";
import { ROLES } from "../../configs/constants";
import BackButton from "../../shared/layout/buttons/back-button";

const EmployeesAddPage = () => {
  const { globalState, setGlobalState } = useContext(GlobalStateContext);
  const navigate = useNavigate();

  // TODO: to retrieve employees from API // should return only employees that are
  const [employees, setEmployees] = useState<IUser[]>(
    globalState?.employee || []
  );

  const [employee, setEmployee] = useState({
    name: '',
    phone: '',
    email: '',
    role: ROLES.EMPLOYEE,
    position: 'Barista',
    employmentType: 'Full-Time',
    status: 'Active'
  });

  const resetEmployee = () => {
    setEmployee({
      name: '',
      phone: '',
      email: '',
      role: ROLES.EMPLOYEE,
      position: 'Barista',
      employmentType: 'Full-Time',
      status: 'Active'
    });
  };

  const [errorMessage, setErrorMessage] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [inputColor, setInputColor] = useState({
    name: 'gray',
    phone: 'gray',
    email: 'gray',
  })

  const addEmployeeFunc = () => {
    setErrorMessage(prev => ({
      ...prev,
      firstName: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      lastName: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      phone: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      email: '',
    }));
    //Check Error
    if (!validName(employee.name) || !isNumber(employee.phone) || (employee.phone.length != 8) || !validEmail(employee.email)) {
      if (!validName(employee.name)) {
        setErrorMessage(prev => ({
          ...prev,
          firstName: '"First name must consist of letters only.',
        }));
        setInputColor(prev => ({
          ...prev,
          firstName: 'failure',
        }));
      }
      if (!isNumber(employee.phone) || (employee.phone.length != 8)) {
        console.log(employee.phone.length)
        setErrorMessage(prev => ({
          ...prev,
          phone: 'Phone must contain only 8 numbers.',
        }));
        setInputColor(prev => ({
          ...prev,
          phone: 'failure',
        }));
      }
      if (!validEmail(employee.email)) {
        setErrorMessage(prev => ({
          ...prev,
          email: 'Email must be in the format "emp@sim.com".',
        }));
        setInputColor(prev => ({
          ...prev,
          email: 'failure',
        }));
      }

      toast.error('Invalid Details.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        progress: undefined,
        theme: "light",
      });
    }
    else {
      const newEmployee: IUser = {
        id: employees.length + 1,
        name: employee.name,
        email: employee.email,
        phoneNo: employee.phone,
        role: employee.role,
        position: employee.position,
        employmentType: employee.employmentType,
        status: employee.status
      };
      const updatedEmployees = [...employees];
      updatedEmployees.push(newEmployee);
      setEmployees(updatedEmployees);
      setGlobalState(prev => ({
        ...prev,
        employee: updatedEmployees,
      }));

      toast.success(`Added ${newEmployee.name} Sucessfully.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        progress: undefined,
        theme: "light",
      });
      console.log(employee)
      resetEmployee()
      console.log(employee)
    }
  };

  return (
    <div id="add-employee-page">
      <p className="header">Add</p>
      <div id="user-details" className="w-full md:w-3/5">
        <Label htmlFor="first-name" value="Name" />
        <TextInput
          id="first-name"
          color={inputColor.name}
          placeholder="Name"
          sizing="md"
          required
          value={employee.name}
          helperText={<span className="error-message">{errorMessage.name}</span>}
          style={{ width: '50%' }}
          onChange={(e) => {
            setEmployee(prev => ({
              ...prev,
              name: capitalizeString(e.target.value)
            }))
            setInputColor(prev => ({
              ...prev,
              name: 'gray',
            }))
          }}
          autoComplete="off"
        />
        <div className="mt-2">
          {/* Add margin-top for spacing */}
          <Label htmlFor="email" value="Email" />
          <TextInput
            id="email"
            color={inputColor.email}
            placeholder="Email"
            sizing="md"
            required
            value={employee.email}
            helperText={<span className="error-message">{errorMessage.email}</span>}
            style={{ width: '50%' }}
            onChange={(e) => {
              setEmployee(prev => ({
                ...prev,
                email: e.target.value.toLowerCase()
              }))
              setInputColor(prev => ({
                ...prev,
                email: 'gray',
              }))
            }}
            autoComplete="off"
          />
        </div>
        <div className="mt-2">
          {/* Add margin-top for spacing */}
          <Label htmlFor="contact" value="Contact" />
          <TextInput
            id="phone"
            color={inputColor.phone}
            placeholder="Phone"
            sizing="md"
            required
            value={employee.phone}
            helperText={<span className="error-message">{errorMessage.phone}</span>}
            style={{ width: '50%' }}
            onChange={(e) => {
              setEmployee(prev => ({
                ...prev,
                phone: e.target.value
              }))
              setInputColor(prev => ({
                ...prev,
                phone: 'gray',
              }))
            }}
            autoComplete="off"
          />

        </div>
        <div className="mt-2">
          {/* Add margin-top for spacing */}
          {/*
          <div className="flex items-center gap-2">
            <Checkbox id="auth-link" />
            <Label
              htmlFor="auth-link"
              value="Send authentication link to email"
            />
          </div>
          */}
        </div>
        <div className="mt-2">
          {/* Add margin-top for spacing */}
          <Label htmlFor="role" value="Role" />
          <Select
            id="role"
            value={employee.role === ROLES.EMPLOYEE ? 'Employee' : employee.role === ROLES.SCHEDULER ? 'Manager' : employee.role === ROLES.SYSADMIN ? 'System Admin' : ''}
            required
            onChange={(e) => {
              const selectedRole = e.target.value;
              let roleValue = '';
              if (selectedRole === 'Employee') {
                roleValue = ROLES.EMPLOYEE;
              } else if (selectedRole === 'Manager') {
                roleValue = ROLES.SCHEDULER;
              } else if (selectedRole === 'System Admin') {
                roleValue = ROLES.SYSADMIN;
              }
              setEmployee(prev => ({
                ...prev,
                role: roleValue
              }));
            }}
            style={{ width: '50%' }}>
            <option>
              Employee
            </option>
            <option>
              Manager
            </option>
            <option>
              System Admin
            </option>
          </Select>
        </div>
        <div className="mt-2">
          {/* Add margin-top for spacing */}
          <Label htmlFor="position" value="Position" />
          <Select
            id="position"
            value={employee.position}
            required
            onChange={(e) => {
              setEmployee(prev => ({
                ...prev,
                position: e.target.value
              }));
            }}
            style={{ width: '50%' }}
          >
            <option>
              Barista
            </option>
            <option>
              Server
            </option>
            <option>
              Manager
            </option>
          </Select>
        </div>

        <div className="mt-4 flex">
          {/* Add margin-top for spacing */}
          <div className="pr-2">
            <BackButton />
          </div>
          <div className="pr-2">
            <Button color="success"
              onClick={() => addEmployeeFunc()}
              disabled={!employee.name || !employee.email || !employee.phone}>
              <HiUserAdd className="mr-2 my-auto" />
              Add
            </Button>
          </div>
        </div>

      </div>
      <ToastContainer />
    </div>
  );
};

export default EmployeesAddPage;

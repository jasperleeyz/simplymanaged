import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { GlobalStateContext } from "../../configs/global-state-provider"
import { Button, Label, TextInput, Select, Modal} from "flowbite-react"
import { capitalizeString, validName, isNumber, validEmail } from "../../configs/utils"
import { HiOutlineExclamationCircle } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { PATHS } from "../../configs/constants"
import IUser from "../../shared/model/user.model"
import { ROLES } from "../../configs/constants"

const EmployeesEditPage = () => {

  const { globalState, setGlobalState } = React.useContext(GlobalStateContext)
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<IUser[]>(
    globalState?.employee || []
  );
  const [authEdit, setAuthEdit] = useState(false);
  const [editEmployee, setEditEmployee] = useState<IUser>({
    id: 0,
    name: "",
    email: "",
    phoneNo: "",
    role: ROLES.EMPLOYEE,
    position: "STORE MANAGER",
    employmentType: "FULL-TIME"
  });
  const [applied, setApplied] = useState(false)
  const [deleted, setDeleted] = useState(false)

  useEffect(() => {
    const tempData = (localStorage.getItem('editEmployee') || '')
    if (tempData != '') {
      const data = JSON.parse(tempData)
      const tempEmployee: IUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        role: data.role,
        position: data.position,
        employmentType: data.employmentType,
      };
      setEditEmployee(tempEmployee);
      localStorage.removeItem('editEmployee');
      setAuthEdit(true);
    }
  }, []);

  const [newEmployeeData, setNewEmployeeData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    location: "test"
  });

  const resetNewEmployeeData = () => {
    setNewEmployeeData({
      name: '',
      phone: '',
      email: '',
      role: '',
      location: "test"
    });
  };

  const isEmptyNewEmployeeData = () => {
    console.log(newEmployeeData)
    return newEmployeeData.name == '' && 
    newEmployeeData.phone == '' &&
    newEmployeeData.email == '' &&
    newEmployeeData.role == ''
  }

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [inputColor, setInputColor] = useState({
    name: 'gray',
    phone: 'gray',
    email: 'gray',
  })

  const removeEmployeeFunc = () => {
    // Create a shallow copy of the current employees array excluding the employee to be removed
    const updatedEmployees = employees.filter((employee) => employee.id !== editEmployee.id)
    // Update the state with the new array
    setEmployees(updatedEmployees)
    // If needed, update the global state with the updated employees array
    setGlobalState((prev) => ({
      ...prev,
      employee: updatedEmployees,
    }))

    setDeleted(true)
    props.setOpenModal(undefined)

    toast.success('Employee Deleted.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      progress: undefined,
      theme: "light",
    });

    setTimeout(() => {
      navigate(`/${PATHS.EMPLOYEES}`)
    }, 3000);
  }

  const editEmployeeFunc = () => {
    setErrorMessage(prev => ({
      ...prev,
      name: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      phone: '',
    }));
    setErrorMessage(prev => ({
      ...prev,
      email: '',
    }));

    if (!validName(newEmployeeData.name) || !isNumber(newEmployeeData.phone) || !validEmail(newEmployeeData.email)) {
      if (!validName(newEmployeeData.name)) {
        setErrorMessage(prev => ({
          ...prev,
          name: '"Name must consist of letters only.',
        }));
        setInputColor(prev => ({
          ...prev,
          name: 'failure',
        }));
      }
      if (!isNumber(newEmployeeData.phone)) {
        setErrorMessage(prev => ({
          ...prev,
          phone: 'Phone must contain only numbers.',
        }));
        setInputColor(prev => ({
          ...prev,
          phone: 'failure',
        }));
      }
      if (!validEmail(newEmployeeData.email)) {
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
      const tempEmployeeData: IUser = {
        id: editEmployee.id,
        name: newEmployeeData.name,
        email: newEmployeeData.email,
        phoneNo: newEmployeeData.phone,
        role: newEmployeeData.role,
        position: editEmployee.position,
        employmentType: editEmployee.employmentType,
      };
      setEditEmployee(tempEmployeeData);
      setApplied(true);
      resetNewEmployeeData()
        toast.success('Employee Updated Sucessfully.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          progress: undefined,
          theme: "light",
        });
    }
  }

  const saveEmployeeFunc = () => {
    const updatedEmployees = employees
    .filter((employee) => employee) // Filter out undefined values
    .map((employee) =>
      employee.id === editEmployee.id ? editEmployee : employee
    );

    // Filtered array with undefined values removed
    const filteredUpdatedEmployees = updatedEmployees.filter(
      (employee) => employee !== undefined
    );

    setEmployees(filteredUpdatedEmployees);

    setGlobalState((prev) => ({
      ...prev,
      employee: filteredUpdatedEmployees,
    }));

    toast.success('Employee Saved.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      progress: undefined,
      theme: "light",
    });

    setTimeout(() => {
      navigate(`/${PATHS.EMPLOYEES}`)
    }, 3000);


  }

  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };

  return (
    <div>
    {authEdit ? (
      <div id="edit-employee-page">
        <p className="header">Profile</p>
        <div id="user-details" className="w-full md:w-3/5">
              <Label htmlFor="name" value="Name" />
              <TextInput
                id="name"
                color={inputColor.name}
                placeholder= {editEmployee?.name}
                sizing="md"
                required
                value = {newEmployeeData.name}
                style={{ width: '50%' }}
                helperText={<span className="error-message">{errorMessage.name}</span>}
                onChange={(e) => {
                  if(!deleted){
                    setNewEmployeeData(prev => ({
                      ...prev,
                      name: capitalizeString(e.target.value)
                    }))
                    setInputColor(prev => ({
                      ...prev,
                      name: 'gray',
                    }))
                    setApplied(false)
                  }
                }}
                autoComplete="off"
              />
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="email" value="Email" />
                <TextInput
                id="email"
                color={inputColor.email}
                placeholder= {editEmployee?.email}
                sizing="md"
                required
                value = {newEmployeeData.email}
                style={{ width: '50%' }}
                helperText={<span className="error-message">{errorMessage.email}</span>}
                onChange={(e) => {
                  if(!deleted){
                    setNewEmployeeData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))
                    setInputColor(prev => ({
                      ...prev,
                      email: 'gray',
                    }))
                    setApplied(false)
                  }
                }}
                autoComplete="off"
              />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="phone" value="Contact" />
                <TextInput
                id="phone"
                color={inputColor.phone}
                placeholder={editEmployee?.phoneNo}
                sizing="md"
                required
                value = {newEmployeeData.phone}
                style={{ width: '50%' }}
                helperText={<span className="error-message">{errorMessage.phone}</span>}
                onChange={(e) => {
                  if(!deleted){
                    setNewEmployeeData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))
                    setInputColor(prev => ({
                      ...prev,
                      phone: 'gray',
                    }))
                    setApplied(false)
                  }
                }}
                autoComplete="off"
              />
          </div>
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="role" value="Role" />
            <Select
              id="role"
              required
              style={{ width: '50%' }}
            >
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
          <div className="mt-2"> {/* Add margin-top for spacing */}
            <Label htmlFor="location" value="Location" />
                <TextInput
                id="phone"
                placeholder="Location"
                sizing="md"
                required
                //value = {''}
                style={{ width: '50%' }}
                //onChange={handleEmailChange}
                autoComplete="off"
              />
          </div>
          <div className="mt-4 flex" > {/* Add margin-top for spacing */}
            <div className="pr-2">
              <Button  color="gray"
              disabled={deleted || (!newEmployeeData.email && !newEmployeeData.phone)}
              onClick={() => editEmployeeFunc() }>
                Apply
              </Button>
            </div>
            <div className="pr-2 pl-2">
              <Button color="gray"
                disabled={deleted || (!applied && isEmptyNewEmployeeData)}
                onClick={() => {saveEmployeeFunc()}}>
                Save
              </Button>
            </div>
            <div className="pl-2">
              <Button color="gray"
                disabled={deleted}
                onClick={() => 
                props.setOpenModal('pop-up')}>
                Delete
              </Button>
              <Modal show={props.openModal === 'pop-up'} size="md" popup onClose={() => props.setOpenModal(undefined)}>
              <Modal.Header />
              <Modal.Body>
                <div className="text-center">
                  <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete {editEmployee?.name}
                  </h3>
                  <div className="flex justify-center gap-4">
                    <Button color="failure" onClick={() => removeEmployeeFunc()}>
                      Yes
                    </Button>
                    <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
                      No
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
      ) : (<div></div>)
    }
    </div>
  );
};

export default EmployeesEditPage

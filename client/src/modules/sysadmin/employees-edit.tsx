import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { GlobalStateContext } from "../../configs/global-state-provider"
import { Button, Label, TextInput, Select, Modal } from "flowbite-react"
import { capitalizeString, validName, isNumber, validEmail } from "../../configs/utils"
import { HiOutlineExclamationCircle, HiCheck, HiX, HiUserRemove, HiUserAdd } from "react-icons/hi"
import { useNavigate } from "react-router-dom"
import { PATHS } from "../../configs/constants"
import IUser from "../../shared/model/user.model"
import { ROLES } from "../../configs/constants"
import BackButton from "../../shared/layout/buttons/back-button";

const EmployeesEditPage = () => {

  const { globalState, setGlobalState } = React.useContext(GlobalStateContext)
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<IUser[]>(
    globalState?.employee || []
  );
  const [auth, setAuth] = useState(false);
  const [editEmployee, setEditEmployee] = useState<IUser>({
    id: 0,
    name: '',
    email: '',
    phoneNo: '',
    role: ROLES.EMPLOYEE,
    position: '',
    employmentType: '',
    status: ''
  });

  const [newEmployeeData, setNewEmployeeData] = useState<IUser>({
    id: 0,
    name: '',
    email: '',
    phoneNo: '',
    role: ROLES.EMPLOYEE,
    position: '',
    employmentType: '',
    status: ''
  });

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
        status: data.status
      };
      setEditEmployee(tempEmployee);
      setNewEmployeeData(tempEmployee);
      localStorage.removeItem('editEmployee');
      setAuth(true);
    }
  }, []);


  const isEdited = () => {
    const keys = Object.keys(editEmployee);
    for (let key of keys) {
      if (editEmployee[key] !== newEmployeeData[key]) {
        return true;
      }
    }
    return false;
  }

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    phoneNo: "",
    email: "",
  });

  const [inputColor, setInputColor] = useState({
    name: 'gray',
    phoneNo: 'gray',
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

    toast.success('Employee deleted');

    setTimeout(() => {
      navigate(`/${PATHS.EMPLOYEES}`)
    }, 3000);
  }

  const activateEmployeeFunc = () => {
    if (editEmployee.status == 'Active') {
      const updatedEmployee = { ...editEmployee, status: 'Deactivated' };
      setEditEmployee(prev => ({ ...prev, status: 'Deactivated' }));
      setNewEmployeeData(editEmployee)
      setNewEmployeeData(prev => ({ ...prev, status: 'Deactivated' }));

      const updatedEmployees = employees
        .filter((employee) => employee) // Filter out undefined values
        .map((employee) =>
          employee.id === updatedEmployee.id ? updatedEmployee : employee
        );

      // Filtered array with undefined values removed
      const filteredUpdatedEmployees = updatedEmployees.filter(
        (employee) => employee !== undefined
      );

      setEmployees(filteredUpdatedEmployees);
      setGlobalState(prev => ({ ...prev, employee: filteredUpdatedEmployees }));
      props.setOpenModal(undefined);

      props.setOpenModal(undefined)

      toast.success(`${newEmployeeData.name} deactivated`);
    }
    else {
      const updatedEmployee = { ...editEmployee, status: 'Active' };
      setEditEmployee(prev => ({ ...prev, status: 'Active' }));
      setNewEmployeeData(editEmployee)
      setNewEmployeeData(prev => ({ ...prev, status: 'Active' }));

      const updatedEmployees = employees
        .filter((employee) => employee) // Filter out undefined values
        .map((employee) =>
          employee.id === updatedEmployee.id ? updatedEmployee : employee
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

      props.setOpenModal(undefined)

      toast.success(`${newEmployeeData.name} activated`);
    }
  }

  const saveEmployeeFunc = () => {
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

    if (!validName(newEmployeeData.name) || !isNumber(newEmployeeData.phoneNo) || !validEmail(newEmployeeData.email)) {
      if (!validName(newEmployeeData.name)) {
        setErrorMessage(prev => ({
          ...prev,
          name: 'Name must consist of letters only.',
        }));
        setInputColor(prev => ({
          ...prev,
          name: 'failure',
        }));
      }
      if (!isNumber(newEmployeeData.phoneNo)) {
        setErrorMessage(prev => ({
          ...prev,
          phoneNo: 'Phone must contain only numbers.',
        }));
        setInputColor(prev => ({
          ...prev,
          phoneNo: 'failure',
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
      toast.error('Invalid details');
    }
    else {
      const updatedEmployees = employees
        .filter((employee) => employee) // Filter out undefined values
        .map((employee) =>
          employee.id === newEmployeeData.id ? newEmployeeData : employee
        );

      // Filtered array with undefined values removed
      const filteredUpdatedEmployees = updatedEmployees.filter(
        (employee) => employee !== undefined
      );

      setEmployees(filteredUpdatedEmployees);
      setEditEmployee(newEmployeeData)

      setGlobalState((prev) => ({
        ...prev,
        employee: filteredUpdatedEmployees,
      }));

      toast.success('Employee saved');
    }
  }

  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };

  return (
    <div>
      {auth ? (
        <div id="edit-employee-page">
          <p className="header">Edit</p>
          <div id="user-details" className="w-full md:w-3/5">
            <Label htmlFor="name" value="Name" />
            <TextInput
              id="name"
              color={inputColor.name}
              sizing="md"
              required
              value={newEmployeeData.name}
              style={{ width: '50%' }}
              helperText={<span className="error-message">{errorMessage.name}</span>}
              onChange={(e) => {
                if (!deleted && newEmployeeData.status != 'Deactivated') {
                  setNewEmployeeData(prev => ({
                    ...prev,
                    name: capitalizeString(e.target.value)
                  }))
                  setInputColor(prev => ({
                    ...prev,
                    name: 'gray',
                  }))
                }
              }}
              autoComplete="off"
            />
            <div className="mt-2"> {/* Add margin-top for spacing */}
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                color={inputColor.email}
                sizing="md"
                required
                value={newEmployeeData.email}
                style={{ width: '50%' }}
                helperText={<span className="error-message">{errorMessage.email}</span>}
                onChange={(e) => {
                  if (!deleted && newEmployeeData.status != 'Deactivated') {
                    setNewEmployeeData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))
                    setInputColor(prev => ({
                      ...prev,
                      email: 'gray',
                    }))
                  }
                }}
                autoComplete="off"
              />
            </div>
            <div className="mt-2"> {/* Add margin-top for spacing */}
              <Label htmlFor="phone" value="Contact" />
              <TextInput
                id="phone"
                color={inputColor.phoneNo}
                sizing="md"
                required
                value={newEmployeeData.phoneNo}
                style={{ width: '50%' }}
                helperText={<span className="error-message">{errorMessage.phoneNo}</span>}
                onChange={(e) => {
                  if (!deleted && newEmployeeData.status != 'Deactivated') {
                    setNewEmployeeData(prev => ({
                      ...prev,
                      phoneNo: e.target.value
                    }))
                    setInputColor(prev => ({
                      ...prev,
                      phoneNo: 'gray',
                    }))
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
                value={newEmployeeData.role === ROLES.EMPLOYEE ? 'Employee' : newEmployeeData.role === ROLES.SCHEDULER ? 'Manager' : newEmployeeData.role === ROLES.SYSADMIN ? 'System Admin' : ''}
                onChange={(e) => {
                  if (!deleted && newEmployeeData.status != 'Deactivated') {
                    const selectedRole = e.target.value;
                    let roleValue = '';
                    if (selectedRole === 'Employee') {
                      roleValue = ROLES.EMPLOYEE;
                    } else if (selectedRole === 'Manager') {
                      roleValue = ROLES.SCHEDULER;
                    } else if (selectedRole === 'System Admin') {
                      roleValue = ROLES.SYSADMIN;
                    }
                    setNewEmployeeData(prev => ({
                      ...prev,
                      role: roleValue
                    }));
                  }
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
            <div className="mt-2"> {/* Add margin-top for spacing */}
              <Label htmlFor="Position" value="Position" />
              <Select
                id="role"
                required
                value={newEmployeeData.position}
                onChange={(e) => {
                  if (!deleted && newEmployeeData.status != 'Deactivated') {
                    setNewEmployeeData(prev => ({
                      ...prev,
                      position: e.target.value
                    }))
                  }
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
            <div className="mt-4 flex" > {/* Add margin-top for spacing */}
              <div className="pr-2">
                <BackButton />
              </div>
              <div className="pr-2 pl-2">
                <Button color="success"
                  disabled={deleted || !isEdited()}
                  onClick={() => { saveEmployeeFunc() }}>
                  <HiCheck className="mr-2 my-auto" />
                  Save
                </Button>
              </div>
              <div className="pl-2">
                {editEmployee.status == 'Active' ? (
                  <div>
                    <Button color="failure"
                      disabled={deleted}
                      onClick={() =>
                        props.setOpenModal('pop-up')}>
                      <HiUserRemove className="mr-2 my-auto" />
                      Deactivate
                    </Button>
                    <Modal show={props.openModal === 'pop-up'} size="md" popup onClose={() => props.setOpenModal(undefined)}>
                      <Modal.Header />
                      <Modal.Body>
                        <div className="text-center">
                          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to deactivate {editEmployee?.name}
                          </h3>
                          <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => activateEmployeeFunc()}>
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
                ) : editEmployee.status == 'Deactivated' ? (
                  <div>
                    <Button color="purple"
                      disabled={deleted}
                      onClick={() =>
                        props.setOpenModal('pop-up')}>
                      <HiUserAdd className="mr-2 my-auto" />
                      Activate
                    </Button>
                    <Modal show={props.openModal === 'pop-up'} size="md" popup onClose={() => { props.setOpenModal(undefined); console.log(newEmployeeData); }}>
                      <Modal.Header />
                      <Modal.Body>
                        <div className="text-center">
                          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to activate {editEmployee?.name}
                          </h3>
                          <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={() => activateEmployeeFunc()}>
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (<div className='text-center'>
        <h1 >400 </h1>
        <div>BAD REQUEST</div>
      </div>)
      }
    </div>
  );
};

export default EmployeesEditPage

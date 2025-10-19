import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layout, Menu, Input, Button, Modal, Form, Table, Space, 
  message, Typography, Tag 
} from 'antd';
import './App.css'; // We'll need to update this

// Define the structure of our Task objects (using TypeScript)
interface Task {
  id: string;
  name: string;
  owner: string;
  command: string;
  taskExecutions?: TaskExecution[]; // Optional
}

interface TaskExecution {
  startTime: string;
  endTime: string;
  output: string;
}

// Your Java API's base URL
const API_URL = 'http://localhost:8080/tasks';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Function to fetch all tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      message.error('Failed to fetch tasks');
    }
    setLoading(false);
  };

  // Fetch tasks when the component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to handle creating a new task
  const handleCreate = async (values: Omit<Task, 'id'>) => {
    try {
      // Simple validation for command
      if (!values.command || values.command.includes("rm")) {
         message.error("Command is unsafe or empty!");
         return;
      }

      // Generate a simple unique ID for the new task
      const newTask = { ...values, id: `task_${Date.now()}` };

      await axios.put(API_URL, newTask);
      message.success('Task created successfully');
      setIsModalVisible(false);
      fetchTasks(); // Refresh the table
      form.resetFields();
    } catch (error) {
      message.error('Failed to create task');
    }
  };

  // Function to handle deleting a task
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Task deleted successfully');
      fetchTasks(); // Refresh the table
    } catch (error) {
      message.error('Failed to delete task');
    }
  };

  // Function to handle searching tasks
  const handleSearch = async (name: string) => {
    if (!name) {
      fetchTasks(); // If search is empty, fetch all
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/findByName?name=${name}`);
      setTasks(response.data);
    } catch (error) {
      // 404 is an expected error if nothing is found
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setTasks([]); // Show an empty table
      } else {
        message.error('Search failed');
      }
    }
    setLoading(false);
  };

  // Define the columns for our table
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a: Task, b: Task) => a.id.localeCompare(b.id) },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a: Task, b: Task) => a.name.localeCompare(b.name) },
    { title: 'Owner', dataIndex: 'owner', key: 'owner' },
    { title: 'Command', dataIndex: 'command', key: 'command', render: (cmd: string) => <Tag color="blue">{cmd}</Tag> },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          {/* We will implement the 'Run' button in Task 4 */}
          <Button disabled>Run (Task 4)</Button> 
        </Space>
      ),
    },
  ];

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">Task Manager</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280, marginTop: 16 }}>
          <Title level={2}>Kaiburr Task Dashboard</Title>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Create New Task
            </Button>
            <Search
              placeholder="Search tasks by name..."
              onSearch={handleSearch}
              enterButton
              style={{ width: 400 }}
            />
          </Space>
          <Table
            columns={columns}
            dataSource={tasks}
            loading={loading}
            rowKey="id"
            // This allows expanding a row to see TaskExecutions
            expandable={{
              expandedRowRender: record => (
                <pre style={{ margin: 0 }}>
                  {record.taskExecutions ? JSON.stringify(record.taskExecutions, null, 2) : 'No executions found.'}
                </pre>
              ),
              rowExpandable: record => record.name !== 'Not Expandable',
            }}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Kaiburr Task 3 ©2025 Created by Joshith</Footer>

      {/* This is the popup modal for creating a new task */}
      <Modal
        title="Create a New Task"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Task Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="command" label="Command" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
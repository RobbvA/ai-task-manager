import React, { useState } from "react";
import { ChakraProvider, Container, Heading, Divider } from "@chakra-ui/react";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/Tasklist.jsx";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ChakraProvider>
      <Container maxW="container.md" py={8}>
        <Heading mb={4}>AI Task Manager</Heading>

        <TaskForm onCreated={() => setRefreshKey((k) => k + 1)} />

        <Divider my={6} />

        <Heading as="h2" size="md" mb={3}>
          Tasks
        </Heading>
        <TaskList refreshKey={refreshKey} />
      </Container>
    </ChakraProvider>
  );
}

export default App;

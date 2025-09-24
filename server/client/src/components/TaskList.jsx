import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

export default function TaskList({ refreshKey = 0 }) {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setState({ loading: false, error: null, items: data });
      } catch (err) {
        if (!cancelled)
          setState({ loading: false, error: err.message, items: [] });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (state.loading) return <Spinner />;
  if (state.error)
    return (
      <Alert status="error">
        <AlertIcon /> {state.error}
      </Alert>
    );
  if (state.items.length === 0) return <Text>No tasks yet</Text>;

  return (
    <Stack spacing={3}>
      {state.items.map((t) => (
        <Box key={t.id} p={3} borderWidth="1px" rounded="md">
          <Heading as="h3" size="sm">
            {t.title}
          </Heading>
          {t.description && <Text mt={1}>{t.description}</Text>}
          <Stack direction="row" mt={2}>
            <Badge>Priority: {t.priority}</Badge>
            {t.status && <Badge colorScheme="purple">{t.status}</Badge>}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

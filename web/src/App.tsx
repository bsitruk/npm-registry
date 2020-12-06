import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
} from "@material-ui/core";
import { Alert, TreeItem, TreeView } from "@material-ui/lab";
import { useEffect, useState } from "react";
import type {
  FormSubmitEvent,
  FormValues,
  Package,
  FetchState,
  PackageResponse,
} from "./types";

function App() {
  const [values, setValues] = useState<FormValues>();
  const [{ loading, data, error }, setFetchData] = useState<FetchState>({
    loading: false,
  });

  useEffect(() => {
    async function fetchPackage({ name, version }: FormValues) {
      const res = await fetch(
        `http://127.0.0.1:3001/package/${name}/${version}`
      );
      const jsonData: PackageResponse = await res.json();
      if ("error" in jsonData) {
        setFetchData({
          data: undefined,
          error: jsonData.error,
          loading: false,
        });
      } else {
        setFetchData({
          data: jsonData,
          error: undefined,
          loading: false,
        });
      }
    }

    if (values) {
      setFetchData({
        data: undefined,
        error: undefined,
        loading: true,
      });
      fetchPackage(values);
    }
  }, [values]);

  const renderTree = (id: number, node: Package) => (
    <TreeItem
      key={id}
      nodeId={id.toString()}
      label={`${node.name} - ${node.version}`}
    >
      {node.dependencies
        ? node.dependencies.map((n) => renderTree(n, data![n]))
        : null}
    </TreeItem>
  );

  const handleSubmit = (e: FormSubmitEvent) => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target).entries()
    ) as FormValues;
    setValues(formData);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <form
          autoComplete="off"
          onSubmit={(e: FormSubmitEvent) => handleSubmit(e)}
        >
          <Box display="flex" flexWrap="wrap" style={{ gap: "2rem" }}>
            <Box flexGrow={3}>
              <TextField label="Package" name="name" required fullWidth />
            </Box>
            <Box flexGrow={1}>
              <TextField label="Version" name="version" required fullWidth />
            </Box>
          </Box>
          <Box mt={2}>
            <Button
              variant="outlined"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
            >
              Play
            </Button>
          </Box>
        </form>
      </Box>

      <Box mt={4} display="flex">
        {loading ? (
          <Box mx="auto">
            <CircularProgress />
          </Box>
        ) : null}

        {data ? (
          <TreeView
            defaultCollapseIcon="⇘"
            defaultExpandIcon="⇨"
            defaultExpanded={["0"]}
          >
            {renderTree(0, data[0])}
          </TreeView>
        ) : null}

        {error ? (
          <Box flexGrow={1}>
            <Alert severity="error"> {error}</Alert>
          </Box>
        ) : null}
      </Box>
    </Container>
  );
}

export default App;

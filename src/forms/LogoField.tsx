import React, { useRef, useState } from "react";
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Icon from "../display/Icon";
import { resolve_size } from "../helpers/formHelper";
import { useFormApi } from "./FormApiContext";


export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

export type LogoFieldChange = {
  logo_url: string | null;
  logo_thumb_url: string | null;
  logo_mime_type: string | null;
};

type LogoFieldProps = {
  label: string;
  size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  current_url?: string | null;
  inherited_url?: string | null;
  upload_url: string;
  clear_url: string;
  /**
   * Optional caption shown beneath the preview — e.g. "Inherited
   * from tenant" when displaying the fallback.
   */
  helper?: string;
  disabled?: boolean;
  onChange: (next: LogoFieldChange) => void;
};

const LogoField: React.FC<LogoFieldProps> = ({
  label,
  size,
  current_url,
  inherited_url,
  upload_url,
  clear_url,
  helper,
  disabled,
  onChange,
}) => {
  const api = useFormApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = current_url ?? inherited_url ?? null;
  const isInherited = !current_url && Boolean(inherited_url);

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("logo", file);
    try {
      const res = await api.post(upload_url, form);
      onChange(res.data as LogoFieldChange);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Upload failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.delete(clear_url);
      onChange(res.data as LogoFieldChange);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Clear failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box className={`${resolve_size(size)}`} sx={{ p: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            height: 128,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            minWidth: previewUrl ? undefined : 128,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            bgcolor: "background.default",
            opacity: isInherited ? 0.6 : 1,
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt={label}
              sx={{ maxWidth: "100%", width: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              No logo
            </Typography>
          )}
        </Box>
        <Stack spacing={0.5}>
          <Tooltip title={current_url ? "Replace logo" : "Upload logo"}>
            <span>
              <IconButton
                size="medium"
                onClick={handlePick}
                disabled={disabled || busy}
              >
                {busy ? (
                  <CircularProgress size={18} />
                ) : (
                  <Icon name="CloudUploadOutlined" fontSize="medium" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          {current_url ? (
            <Tooltip title="Clear logo">
              <span>
                <IconButton
                  size="medium"
                  color="error"
                  onClick={handleClear}
                  disabled={disabled || busy}
                >
                  <Icon name="DeleteOutline" fontSize="medium" />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
          {error ? (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <input
        ref={fileRef}
        type="file"
        accept={LOGO_ACCEPT}
        hidden
        onChange={handleFile}
      />
    </Box>
  );
};

export default LogoField;

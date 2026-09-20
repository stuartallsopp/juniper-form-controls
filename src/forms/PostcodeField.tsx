import { useState } from "react";
import FormField from "./FormField";

/** Transport for the postcode check. Each app supplies its own —
 *  the bureau hits `/tools/validate-postcode`, the employer portal
 *  `/employer/tools/validate-postcode` — so this component stays
 *  agnostic of axios instances and auth. */
export type PostcodeCheck = (
    postcode: string,
) => Promise<{ valid: boolean; formatted: string | null }>;

type PostcodeFieldProps = {
    check: PostcodeCheck;
    value?: string;
    handleChange: (val: string) => void;
    label?: string;
    size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    max?: number;
    disabled?: boolean;
    has_errors?: boolean;
    errors?: string[];
    changes?: {
        path: string;
        id?: string | null;
        type?: string;
        callback: (k: string) => boolean;
    };
};

/**
 * A `Post code` text field that validates UK postcode *format* on blur
 * against the backend `validate-postcode` tool. It's a soft check: an
 * unrecognised value shows an inline hint but never blocks the form, and a
 * recognised value is rewritten to its canonical spacing/case ("sw1a1aa" →
 * "SW1A 1AA"). Format only — not real-world deliverability.
 *
 * Each instance owns its own hint state, so it drops straight into repeated
 * rows (e.g. per emergency contact) without a shared keyed map.
 */
const PostcodeField: React.FC<PostcodeFieldProps> = ({
    check,
    value,
    handleChange,
    label = "Post code",
    size,
    max = 15,
    disabled,
    has_errors,
    errors,
    changes,
}) => {
    const [hint, setHint] = useState<string | undefined>(undefined);

    // FormField commits on blur by default, so this fires once the operator
    // leaves the field — the right moment to round-trip a soft format check.
    const commit = async (val: string): Promise<void> => {
        handleChange(val);
        const trimmed = (val ?? "").trim();
        if (!trimmed) {
            setHint(undefined);
            return;
        }
        try {
            const { valid, formatted } = await check(trimmed);
            if (valid) {
                setHint(undefined);
                if (formatted && formatted !== val) {
                    handleChange(formatted);
                }
            } else {
                setHint("This doesn't look like a valid UK postcode.");
            }
        } catch {
            // A soft check must never trap the operator — if the lookup
            // fails (offline, 5xx) we simply skip the hint.
            setHint(undefined);
        }
    };

    return (
        <FormField
            type="text"
            uppercase
            label={label}
            size={size}
            max={max}
            disabled={disabled}
            value={value}
            handleChange={commit}
            changes={changes}
            has_errors={has_errors || !!hint}
            errors={hint ? [...(errors ?? []), hint] : errors}
        />
    );
};

export default PostcodeField;

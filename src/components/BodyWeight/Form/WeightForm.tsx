import { Button, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "components/BodyWeight/model";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import React, { useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { createWeight, updateWeight } from "services";
import { setNotification, SetWeightState, useWeightStateValue } from "state";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: Function,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const [state, dispatch] = useWeightStateValue();
    const [dateValue, setDateValue] = React.useState<Date | null>(weightEntry ? weightEntry.date : new Date());
    const [t, i18n] = useTranslation();

    const updateWeightEntry = useCallback(async (entry: WeightEntry) => {
        const action = { type: SetWeightState.UPDATE_WEIGHT, payload: entry };
        dispatch(action);
        dispatch(setNotification(
            {
                notify: true,
                message: "Successful",
                severity: "success",
                title: "Success",
                type: "other"
            }
        ));
        // clear out the notifications after some times
        setTimeout(() => {
            dispatch(setNotification({ notify: false, message: "", severity: undefined, title: "", type: undefined }));
        }, 5000);
    }, [dispatch]);

    const createWeightEntry = useCallback(async (entry: WeightEntry) => {
        const action = { type: SetWeightState.ADD_WEIGHT, payload: entry };
        dispatch(action);
        dispatch(setNotification(
            {
                notify: true,
                message: "Successful",
                severity: "success",
                title: "Success",
                type: "other"
            }
        ));
        // clear out the notifications after some times
        setTimeout(() => {
            dispatch(setNotification({ notify: false, message: "", severity: undefined, title: "", type: undefined }));
        }, 5000);
    }, [dispatch]);

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(30, 'Min weight is 30 kg')
            .max(300, 'Max weight is 300 kg')
            .required('Weight field is required'),
    });


    return (
        <Formik
            initialValues={{
                weight: weightEntry ? weightEntry.weight : 0,
                date: weightEntry ? dateToYYYYMMDD(weightEntry.date) : dateToYYYYMMDD(new Date()),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                if (weightEntry) {
                    // Edit existing weight entry
                    weightEntry.weight = values.weight;
                    weightEntry.date = new Date(values.date);
                    try {
                        const editedWeightEntry = await updateWeight(weightEntry);
                        await updateWeightEntry(editedWeightEntry);
                    } catch (error) {
                        dispatch(setNotification(
                            {
                                notify: true,
                                message: error as string,
                                severity: "error",
                                title: "Failed to save",
                                type: "other"
                            }
                        ));
                        setTimeout(() => {
                            dispatch(setNotification({
                                notify: false,
                                message: "",
                                severity: undefined,
                                title: "",
                                type: undefined
                            }));
                        }, 5000);
                    }

                } else {
                    // Create new weight entry
                    weightEntry = new WeightEntry(new Date(values.date), values.weight);
                    try {
                        const newWeightEntry = await createWeight(weightEntry);
                        await createWeightEntry(newWeightEntry);
                    } catch (error) {
                        dispatch(setNotification(
                            {
                                notify: true,
                                message: error as string,
                                severity: "error",
                                title: "Failed to save",
                                type: "other"

                            }
                        ));
                        setTimeout(() => {
                            dispatch(setNotification({
                                notify: false,
                                message: "",
                                severity: undefined,
                                title: "",
                                type: undefined
                            }));
                        }, 5000);
                    }
                }

                // if closeFn is defined, close the modal (this form does not have to
                // be displayed in a modal)
                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="weight"
                            label={t('weight')}
                            error={formik.touched.weight && Boolean(formik.touched.weight)}
                            helperText={formik.touched.weight && formik.errors.weight}
                            {...formik.getFieldProps('weight')}
                        />

                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <DatePicker
                                inputFormat="yyyy-MM-dd"
                                label={t('date')}
                                value={dateValue}
                                renderInput={(params) => <TextField {...params} {...formik.getFieldProps('date')} />}
                                disableFuture={true}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue('date', newValue);
                                    }
                                    setDateValue(newValue);
                                }}
                                shouldDisableDate={(date) => {

                                    // Allow the date of the current weight entry, since we are editing it
                                    if (weightEntry && dateToYYYYMMDD(weightEntry.date) === (date as unknown as DateTime).toISODate()) {
                                        return false;
                                    }

                                    // if date is in list of weight entries, disable it
                                    if (date) {
                                        return state.weights.some(entry => dateToYYYYMMDD(entry.date) === (date as unknown as DateTime).toISODate());
                                    }

                                    // all other dates are allowed
                                    return false;
                                }}
                            />
                        </LocalizationProvider>
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Grid,
    ImageListItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { addExerciseBase, addExerciseTranslation, postAlias, postExerciseImage } from "services";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { addVariation } from "services/variation";
import { useNavigate } from "react-router-dom";
import { useCategoriesQuery, useEquipmentQuery, useLanguageQuery, useMusclesQuery } from "components/Exercises/queries";
import { getTranslationKey } from "utils/strings";
import ImageList from "@mui/material/ImageList";
import { useExerciseStateValue } from "state";
import { addNote } from "services/note";
import { Note } from "components/Exercises/models/note";
import { useProfileQuery } from "components/User/queries/profile";
import { makeLink, WgerLink } from "utils/url";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";

export const Step6Overview = ({ onBack }: StepProps) => {
    const [t, i18n] = useTranslation();
    const [state] = useExerciseStateValue();

    const navigate = useNavigate();
    const categoryQuery = useCategoriesQuery();
    const languageQuery = useLanguageQuery();
    const musclesQuery = useMusclesQuery();
    const equipmentQuery = useEquipmentQuery();
    const profileQuery = useProfileQuery();

    // This could be handled better and more cleanly...
    type submissionStatus = 'initial' | 'loading' | 'done';
    const [submissionState, setSubmissionState] = useState<submissionStatus>('initial',);

    const submitExercise = async () => {

        setSubmissionState('loading');

        // Create a new variation object if needed
        // TODO: PATCH the other exercise base (newVariationBaseId) with the new variation id
        let variationId;
        if (state.newVariationBaseId !== null) {
            variationId = await addVariation();
        } else {
            variationId = state.variationId;
        }

        // Create the base
        const baseId = await addExerciseBase(
            state.category as number,
            state.equipment,
            state.muscles,
            state.musclesSecondary,
            variationId,
            profileQuery.data!.username
        );

        // Create the English translation
        const exercise = await addExerciseTranslation(
            baseId,
            ENGLISH_LANGUAGE_ID,
            state.nameEn,
            state.descriptionEn,
            profileQuery.data!.username
        );

        // For each entry in alternative names, create a new alias
        for (const alias of state.alternativeNamesEn) {
            await postAlias(exercise.id!, alias);
        }

        // Post the images
        for (const image of state.images) {
            await postExerciseImage(baseId, profileQuery.data!.username, image.file);
        }

        // Post the notes
        for (const note of state.notesEn) {
            await addNote(new Note(null, exercise.id!, note));
        }


        // Create the translation if needed
        if (state.languageId !== null) {
            const exerciseI18n = await addExerciseTranslation(
                baseId,
                state.languageId,
                state.nameI18n,
                state.descriptionI18n,
                profileQuery.data!.username
            );

            for (const alias of state.alternativeNamesI18n) {
                await postAlias(exerciseI18n.id!, alias);
            }

            for (const note of state.notesI18n) {
                await addNote(new Note(null, exerciseI18n.id!, note));
            }
        }

        console.log("Exercise created");
        setSubmissionState('done');
    };

    const navigateToOverview = () => {
        navigate(makeLink(WgerLink.EXERCISE_OVERVIEW, i18n.language));
    };

    return equipmentQuery.isLoading || languageQuery.isLoading || musclesQuery.isLoading || categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <>
            <Typography variant={"h6"}>
                {t('exercises.step1HeaderBasics')}
            </Typography>
            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>{t('name')}</TableCell>
                            <TableCell>{state.nameEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.alternativeNames')}</TableCell>
                            <TableCell>{state.alternativeNamesEn.join(", ")}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('description')}</TableCell>
                            <TableCell>{state.descriptionEn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.notes')}</TableCell>
                            <TableCell>{state.notesEn.map(note => <>{note}<br /></>)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('category')}</TableCell>
                            <TableCell>{t(getTranslationKey(categoryQuery.data!.find(c => c.id === state.category)!.name))}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.equipment')}</TableCell>
                            <TableCell>{state.equipment.map(e => t(getTranslationKey(equipmentQuery.data!.find(value => value.id === e)!.name))).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.muscles')}</TableCell>
                            <TableCell>{state.muscles.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.secondaryMuscles')}</TableCell>
                            <TableCell>{state.musclesSecondary.map(m => musclesQuery.data!.find(value => value.id === m)!.getName(t)).join(', ')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t('exercises.variations')}</TableCell>
                            <TableCell>{state.variationId} / {state.newVariationBaseId}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {state.images.length > 0 && (
                <ImageList
                    cols={3}
                    style={{ maxHeight: "200px", }}>
                    {state.images.map(imageEntry => (
                        <ImageListItem key={imageEntry.url}>
                            <img
                                style={{ maxHeight: "200px", maxWidth: "200px" }}
                                src={imageEntry.url}
                                alt=""
                                loading="lazy"
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}


            {state.languageId !== null && (
                <>
                    <Typography variant={"h6"} sx={{ mt: 3 }}>
                        {languageQuery.data!.find(l => l.id === state.languageId)!.nameLong}
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{t('name')}</TableCell>
                                    <TableCell>
                                        {state.nameI18n}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>{t('exercises.alternativeNames')}</TableCell>
                                    <TableCell>{state.alternativeNamesI18n.join(", ")}</TableCell>
                                </TableRow>


                                <TableRow>
                                    <TableCell>{t('description')}</TableCell>
                                    <TableCell>{state.descriptionI18n}</TableCell>
                                </TableRow>


                                <TableRow>
                                    <TableCell>{t('exercises.notes')}</TableCell>
                                    <TableCell>{state.notesI18n.map(note => <>{note}<br /></>)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {!(submissionState === 'done')
                ? <Alert severity="info" sx={{ mt: 2 }}>
                    {t('exercises.checkInformationBeforeSubmitting')}
                </Alert>
                : <Alert severity="success" sx={{ mt: 2 }}>
                    <AlertTitle>{t('success')}</AlertTitle>
                    {t('exercises.cacheWarning')}
                </Alert>
            }

            <Grid container>
                <Grid item xs={12} display="flex" justifyContent={"end"}>
                    <Box sx={{ mb: 2 }}>
                        <div>
                            {submissionState !== 'done' &&
                                <Button
                                    onClick={onBack}
                                    sx={{ mt: 1, mr: 1 }}
                                >
                                    {t('goBack')}
                                </Button>
                            }
                            {submissionState !== 'done'
                                && <Button
                                    variant="contained"
                                    disabled={submissionState !== 'initial'}
                                    onClick={submitExercise}
                                    sx={{ mt: 1, mr: 1 }}
                                    color='info'
                                >
                                    {t('exercises.submitExercise')}
                                </Button>
                            }
                            {submissionState === 'done'
                                && <Button
                                    variant="contained"
                                    onClick={navigateToOverview}
                                    sx={{ mt: 1, mr: 1 }}
                                    color='success'
                                >
                                    {t('overview')}
                                    <NavigateNextIcon />
                                </Button>
                            }
                        </div>
                    </Box>
                </Grid>
            </Grid>
        </>;
};

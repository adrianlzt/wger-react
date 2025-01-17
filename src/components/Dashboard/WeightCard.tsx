import { Button, Card, CardActions, CardContent, CardHeader, } from '@mui/material';
import React from 'react';
import { Link } from "react-router-dom";
import { OverviewDashboard } from "components/BodyWeight/OverviewDashboard/OverviewDashboard";
import { WeightForm } from "components/BodyWeight/Form/WeightForm";
import { WgerModal } from "components/Core/Modals/WgerModal";
import { useTranslation } from "react-i18next";

export const WeightCard = () => {

    const [openModal, setOpenModal] = React.useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);
    const [t] = useTranslation();

    return (
        <div>
            <Card>
                <CardHeader title={t('weight')} />
                <CardContent>
                    <p>{t('currentWeight')}</p>
                    <OverviewDashboard />
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={handleOpenModal}>{t('addEntry')}</Button>
                    <Button size="small"><Link to="weight/overview">Weight Overview</Link></Button>
                </CardActions>
            </Card>
            <WgerModal title={t('add')} isOpen={openModal} closeFn={handleCloseModal}>
                <WeightForm closeFn={handleCloseModal} />
            </WgerModal>
        </div>
    );
};
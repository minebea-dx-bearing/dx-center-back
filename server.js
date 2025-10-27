require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// NAT
app.use("/nat/tn/tn-realtime", require("./api_nat/nat_tn_tn_realtime"));
app.use("/nat/tn/tn-summary", require("./api_nat/nat_tn_tn_summary"));
app.use("/nat/gd/2ndinbore-realtime", require("./api_nat/nat_gd_2ndinbore_realtime"));
app.use("/nat/gd/2ndinrace-realtime", require("./api_nat/nat_gd_2ndinrace_realtime"));
app.use("/nat/gd/2ndinsuper-realtime", require("./api_nat/nat_gd_2ndinsuper_realtime"));
app.use("/nat/gd/2ndoutrace-realtime", require("./api_nat/nat_gd_2ndoutrace_realtime"));
app.use("/nat/gd/2ndoutsuper-realtime", require("./api_nat/nat_gd_2ndoutsuper_realtime"));
app.use("/nat/assy/mbr-realtime", require("./api_nat/nat_assy_mbr_realtime"));
app.use("/nat/assy/arp-realtime", require("./api_nat/nat_assy_arp_realtime"));
app.use("/nat/assy/gssm-realtime", require("./api_nat/nat_assy_gssm_realtime"));
app.use("/nat/assy/fim-realtime", require("./api_nat/nat_assy_fim_realtime"));
app.use("/nat/assy/ant-realtime", require("./api_nat/nat_assy_ant_realtime"));
app.use("/nat/assy/aod-realtime", require("./api_nat/nat_assy_aod_realtime"));
app.use("/nat/assy/avs-realtime", require("./api_nat/nat_assy_avs_realtime"));
app.use("/nat/assy/alu-realtime", require("./api_nat/nat_assy_alu_realtime"));
app.use("/nat/assy/combine-realtime", require("./api_nat/nat_assy_combine_realtime"));

// NHB
app.use("/nhb/tn/tn-realtime", require("./api_nhb/nhb_tn_tn_realtime"));

// NMB
app.use("/nmb/assy/agr-realtime", require("./api_nmb/nmb_assy_agr_realtime"));
app.use("/nmb/assy/alu-realtime", require("./api_nmb/nmb_assy_alu_realtime"));
app.use("/nmb/assy/and-realtime", require("./api_nmb/nmb_assy_and_realtime"));
app.use("/nmb/assy/aps-realtime", require("./api_nmb/nmb_assy_aps_realtime"));
app.use("/nmb/assy/arp-realtime", require("./api_nmb/nmb_assy_arp_realtime"));
app.use("/nmb/assy/asl-realtime", require("./api_nmb/nmb_assy_asl_realtime"));
app.use("/nmb/assy/asr-realtime", require("./api_nmb/nmb_assy_asr_realtime"));
app.use("/nmb/assy/ass-realtime", require("./api_nmb/nmb_assy_ass_realtime"));
app.use("/nmb/assy/avs-realtime", require("./api_nmb/nmb_assy_avs_realtime"));

// PELMEC
app.use("/pelmec_mms_turning", require("./api_pelmec/pelmec_mms_turning"));
app.use("/pelmec_mms_turning_realtime", require("./api_pelmec/pelmec_mms_turning_realtime"));
app.use("/pelmec_mms_cold_forming", require("./api_pelmec/pelmec_mms_cold_forming"));
app.use("/pelmec_mms_cold_forming_realtime", require("./api_pelmec/pelmec_mms_cold_forming_realtime"));
app.use("/pelmec_mms_gd_inner_ring", require("./api_pelmec/pelmec_mms_gd_inner_ring"));
app.use("/pelmec_mms_gd_inner_ring_realtime", require("./api_pelmec/pelmec_mms_gd_inner_ring_realtime"));
app.use("/pelmec_mms_press_shield", require("./api_pelmec/pelmec_mms_press_shield"));
app.use("/pelmec_mms_auto_press_realtime", require("./api_pelmec/pelmec_mms_auto_press_realtime"));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
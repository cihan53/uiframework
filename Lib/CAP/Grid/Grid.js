import React from "react";
import {observer} from "mobx-react/index";
import PropTypes from "prop-types";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import overlayFactory from 'react-bootstrap-table2-overlay';
import filterFactory from "react-bootstrap-table2-filter";
import cellEditFactory, {Type} from "react-bootstrap-table2-editor";
import StoreManager from "../../StoreManager";
import LoadingSpinner from "../../LoadingSpinner";
import Panel from "../Panel/Panel";
import Utils from "../Utils/Utils";


const defaultSorted = [{
    dataField: "name",
    order: "desc"
}];


const EmptyTableDataIndication = () => (
    <div>
        <p>{Utils.__t("Kayıt yok")}</p>
    </div>
);


const Table = ({_ref, data, columns, page, sizePerPage, onTableChange, otherprops, cellEdit = null, totalSize, keyField = "id"}) => {


    let props = {
        tabIndexCell:true,
        remote: true,
        keyField: keyField,
        data: data,
        columns: columns,
        defaultSorted: defaultSorted,
        filter: filterFactory(),
        onTableChange: onTableChange,
        overlay: overlayFactory(<LoadingSpinner key={Utils.ShortId.generate()}/>),
        noDataIndication: () => <EmptyTableDataIndication/>
    };

    //cell edit
    if (cellEdit != null) {
        props.cellEdit = cellEditFactory(cellEdit);
    }

    let showTotal = true;
    let pageStartIndex = 1;
    let paginationSize = 10;

    if (otherprops.pagination)
        props.pagination = paginationFactory({page, sizePerPage, totalSize, showTotal, pageStartIndex, paginationSize});

    delete otherprops.pagination;

    return <BootstrapTable ref={_ref}  {...props} {...otherprops} />;

};

Table.propTypes = {
    data: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    totalSize: PropTypes.number.isRequired,
    sizePerPage: PropTypes.number.isRequired,
    onTableChange: PropTypes.func.isRequired
};

/**
 * eğer sutun filitreleme açık ise
 * autoload false yapılmalı.
 *
 *
 */
@observer
export default class Grid extends React.Component {

    data = null;
    limit = 50;
    autoload = true;
    columns = [];


    constructor(props) {
        super(props);
        this.store = null;
        // this.state = {
        //   page: 1,
        //   data: [],
        //   totalSize: 0,
        //   sizePerPage: 10
        // };
        this.handleTableChange = this.handleTableChange.bind(this);
        this.init = this.init.bind(this);

        this.key = Utils.ShortId.generate();
        this.xgrid = React.createRef();

        this.init();

    }

    init() {

        if (this.props.config.store) {
            if (typeof  this.props.config.store == "string") {
                this.store = StoreManager.get(this.props.config.store) || null;

            } else {
                let storeName = this.props.config.store.name;
                let baseParams = this.props.config.store.baseParams || null;
                let defaultSort = this.props.config.store.defaultSort || null;
                this.store = StoreManager.get(storeName) || null;
                if (baseParams)
                    this.store.setParameters(baseParams);

                if (defaultSort) {
                    this.store.setDefaultSortDir(defaultSort.dir, defaultSort.sort);
                }
            }

            if (!this.store)
                throw new Error("Undefined Store");

            this.autoload = this.props.config.hasOwnProperty('autoload') ? this.props.config.autoload : true;


            //this.store.load();
        } else if (this.props.config.data) {
            this.data = this.props.config.data || [];
            this.autoload = false;
        } else {
            throw new Error("Undefined Store");
        }

        //columns setting

        this.columns = this.props.config.columns || [];
    }

    config() {

    }

    //render before
    componentWillMount() {
        if (this.props.config.hasOwnProperty('onBeforeRender')) {
            this.props.config.onBeforeRender(this);
        }
    }


    componentWillUpdate() {

        if (this.props.config.hasOwnProperty('onBeforeRender')) {
            this.props.config.onBeforeRender(this);
        }
    }

    componentDidCatch(error, info) {
        // Hatanızı bir hata bildirimi servisine de yollayabilirsiniz.
        //logErrorToMyService(error, info);
        console.log(error, info)

    }

    handleTableChange = (type, {
        page,  // newest page
        sizePerPage,  // newest sizePerPage
        sortField,  // newest sort field
        sortOrder,  // newest sort order
        filters, // an object which have current filter status per column
        data, // when you enable remote sort, you may need to base on data to sort if data is filtered/searched
        cellEdit
    }) => {
        if (type != "cellEdit") {
            let currentIndex = (page - 1) * sizePerPage;
            currentIndex = currentIndex < 0 ? 0 : currentIndex

            console.log(currentIndex, page, sizePerPage, sortOrder, filters, data, cellEdit);
            this.store.load({page: page, start: currentIndex, size: sizePerPage, sortField: sortField, sortOrder: sortOrder, filters: filters});
        } else {
            if (this.props.config.hasOwnProperty("cellEdit")) {
                if (this.props.config.cellEdit.hasOwnProperty("afterSaveCell")) {

                    /**
                     * cellEdit
                     *    { rowId,   dataField,  newValue }
                     */
                    this.props.config.cellEdit.afterSaveCell(data, cellEdit);
                }
            }
        }

        // console.log(type,this )
    };

    componentWillMount() {
        const currentIndex = 0;
        if (this.autoload)
            this.store.load({page: 0, start: currentIndex, size: this.limit});
    }

    render() {
        const {totalCount = 0, limit = this.limit, currentPage = 0} = this.store || {totalCount: 0, limit: this.limit, page: 0};
        const data = this.store ? this.store.data : this.data;

        //other props
        let otherProps = {};

        //keyfield
        let keyField = this.store ? this.store.keyField : "id";
        if (this.props.config.hasOwnProperty("keyField"))
            keyField = this.props.config.keyField;

        //cell Editor
        let cellEdit = null;
        if (this.props.config.hasOwnProperty("cellEdit")) {
            cellEdit = this.props.config.cellEdit;
        }


        //bunlar varsayılan props'lar bunlar haricindeki tüm prop'lar otherprops eklenecek
        const props = ["store", "keyField", "data", "currentPage", "sizePerPage", "columns", "totalSize", "onTableChange", "panelOptions", "xtype", "cellEdit"];
        const keys = Object.keys(this.props.config);
        for (const keyIndex in keys) {
            const key = keys[keyIndex];
            if (props.indexOf(key) == -1) {
                otherProps[key] = this.props.config[key];
            }
        }

        let T = <Table
            _ref={this.xgrid}
            key={this.key}
            keyField={keyField}
            data={data}
            page={currentPage}
            sizePerPage={limit}
            columns={this.columns}
            totalSize={totalCount}
            otherprops={otherProps}
            onTableChange={this.handleTableChange}
            cellEdit={cellEdit}
        />;


        if (this.props.config.xtype == "gridPanel") {
            return <Panel items={[T]} config={this.props.config.panelOptions}/>;
        }

        return (T);
    }
}



